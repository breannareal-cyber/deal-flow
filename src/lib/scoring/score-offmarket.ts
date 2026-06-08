// Off-market scorer — DETERMINISTIC (no LLM). Off-market candidates have no
// disclosed financials, so the financial deal-killer gates are unknowable pre-
// contact ('?') and the fit score is built from observable signals: business age,
// site staleness, sector keywords, crew-size proxy. Weights live in buybox-config
// (OFFMARKET_WEIGHTS) so the thesis is retunable in code, not here.
//
// Future enhancement (plan D4): a small LLM call to refine sector-fit nuance,
// improvability, and key-man read from site text. v1 stays deterministic so it
// runs with zero credentials and is fully unit-testable.

import type { Listing, Score, OffMarketScore, DealKiller } from '@/lib/types';
import { DEAL_KILLER_GATES, OFFMARKET_WEIGHTS, type OffMarketWeights } from './buybox-config';

const BULLSEYE = [
  'well', 'pump', 'water', 'septic', 'wastewater', 'sewer', 'drilling',
  'treatment', 'filtration', 'groundwater', 'environmental',
];
const ADJACENT = ['hvac', 'utility', 'plumbing', 'irrigation'];

function yearOf(isoDate: string | null | undefined): number | null {
  if (!isoDate) return null;
  const m = String(isoDate).match(/^(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

function band(value: number, cuts: [number, number][]): number {
  // cuts: [[threshold, score], ...] descending by threshold; first match wins.
  for (const [t, s] of cuts) if (value >= t) return s;
  return 0;
}

function wordHit(haystack: string, words: string[]): boolean {
  const hay = haystack.toLowerCase();
  return words.some((w) => new RegExp(`\\b${w}\\b`).test(hay));
}

// --- Dimensions (each 0–5) ---

function longevityScore(listing: Listing, nowYear: number): number {
  if (!listing.yearEstablished) return 0;
  const age = nowYear - listing.yearEstablished;
  return band(age, [[40, 5], [25, 4], [15, 3], [8, 2], [1, 1]]);
}

function modernizationScore(listing: Listing, nowYear: number): number {
  const y = yearOf(listing.siteLastUpdated);
  if (y === null) return 3; // unknown → assume moderate headroom
  const staleness = nowYear - y;
  return band(staleness, [[8, 5], [5, 4], [3, 3], [1, 2], [0, 1]]);
}

function sectorFitScore(listing: Listing): number {
  const text = `${listing.title} ${listing.sector ?? ''} ${listing.description ?? ''}`;
  if (wordHit(text, BULLSEYE)) return 5;
  if (wordHit(text, ADJACENT)) return 3;
  return 1;
}

// Key-man RISK (lower is better). Crew-size proxy: a solo operator is the whole
// business; a real crew survives the owner's exit. Unknown → medium.
function keyManRiskScore(listing: Listing): number {
  const e = listing.employees;
  if (e === null || e === undefined) return 3;
  if (e <= 1) return 4;
  if (e <= 4) return 3;
  return 2;
}

function cashFlowResilienceScore(sectorFit: number): number {
  // Essential, non-discretionary water work is durable; coarse proxy off sector.
  if (sectorFit >= 4) return 4;
  if (sectorFit >= 3) return 3;
  return 2;
}

function sellerMotivationScore(longevity: number, modernization: number): number {
  return Math.round((longevity + modernization) / 2);
}

// --- Assembly ---

function buildDealKillers(keyManRisk: number): DealKiller[] {
  return DEAL_KILLER_GATES.map((g) => {
    if (g.key === 'durability') {
      return { label: g.label, status: '✅', note: 'Essential, non-discretionary water service — AI/disruption-resistant.' };
    }
    if (g.key === 'key_man') {
      const status: DealKiller['status'] = keyManRisk <= 2 ? '✅' : keyManRisk >= 4 ? '❌' : '⚠️';
      return { label: g.label, status, note: 'Inferred from crew-size proxy; confirm owner role + transferable licenses in diligence.' };
    }
    // All financial/SBA gates are unknowable from public registry data.
    return { label: g.label, status: '?', note: 'Not disclosed pre-contact — diligence question.' };
  });
}

export function scoreOffMarket(
  listing: Listing,
  nowYear: number = new Date().getFullYear(),
  weights: OffMarketWeights = OFFMARKET_WEIGHTS
): Score {
  const longevity = longevityScore(listing, nowYear);
  const modernizationHeadroom = modernizationScore(listing, nowYear);
  const sectorFit = sectorFitScore(listing);
  const keyManRisk = keyManRiskScore(listing);
  const cashFlowResilience = cashFlowResilienceScore(sectorFit);
  const sellerMotivation = sellerMotivationScore(longevity, modernizationHeadroom);

  const dimensions: Record<string, number> = {
    longevity,
    cashFlowResilience,
    modernizationHeadroom,
    sectorFit,
    keyManRisk,
    sellerMotivation,
  };

  // Weighted average. keyManRisk is "lower is better", so it contributes its
  // inverse (5 - risk) to the fit score.
  let num = 0;
  let den = 0;
  for (const [k, w] of Object.entries(weights)) {
    const raw = dimensions[k] ?? 0;
    const contribution = k === 'keyManRisk' ? 5 - raw : raw;
    num += contribution * w;
    den += w;
  }
  const weightedTotal = den > 0 ? Math.round((num / den) * 100) / 100 : 0;

  const upsideWithoutOwner = modernizationHeadroom >= 4 && keyManRisk <= 2;

  const offMarket: OffMarketScore = { dimensions, weightedTotal, upsideWithoutOwner };

  const zone: Score['zone'] =
    sectorFit >= 4 ? 'CRITERIA_MATCH' : sectorFit === 3 ? 'WATER_OUTSIDE_SPEND' : 'EXCLUDE';

  const verdict: Score['verdict'] =
    zone === 'EXCLUDE' ? 'PASS'
      : weightedTotal >= 4 ? 'PURSUE'
      : weightedTotal >= 3 ? 'DIG_DEEPER'
      : zone === 'WATER_OUTSIDE_SPEND' ? 'EDGE_CASE'
      : 'DIG_DEEPER';

  const fitFactors = [
    { label: 'Sector fit', value: `${sectorFit}/5` },
    { label: 'Longevity', value: listing.yearEstablished ? `est. ${nowYear - listing.yearEstablished} yrs` : 'unknown' },
    { label: 'Modernization headroom', value: `${modernizationHeadroom}/5` },
    { label: 'Key-man risk', value: `${keyManRisk}/5 (lower better)` },
  ];

  return {
    verdict,
    zone,
    summary: upsideWithoutOwner
      ? `Off-market ${listing.title}: strong modernization upside with a crew that survives the owner.`
      : `Off-market candidate ${listing.title} — fit ${weightedTotal}/5; financials unknown pre-contact.`,
    dealKillers: buildDealKillers(keyManRisk),
    fitFactors,
    topQuestions: [
      'What is the actual EBITDA/SDE, and how clean are the addbacks?',
      'Is the business owner-dependent — who holds the licenses and key customer relationships?',
      'Would the owner consider a sale, and on what structure (seller note)?',
    ],
    scoreReasoning: `Deterministic off-market score. Longevity ${longevity}/5, modernization headroom ${modernizationHeadroom}/5, sector fit ${sectorFit}/5, key-man risk ${keyManRisk}/5. Financial gates are diligence questions until contact.`,
    offMarket,
  };
}
