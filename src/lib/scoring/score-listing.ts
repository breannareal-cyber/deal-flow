// Scoring engine — sends a listing through Claude against the 7-gate buy box.
// Returns a structured Score. Skeptical by default: most deals are a PASS.

import Anthropic from '@anthropic-ai/sdk';
import { config } from '@/lib/config';
import type { Listing, Score, Verdict } from '@/lib/types';
import { BUY_BOX, BUY_BOX_VERSION } from './buybox-config';

const SYSTEM_PROMPT = `You are a skeptical ETA (entrepreneurship-through-acquisition) deal screener for Breanna, a first-time searcher buying a water/environmental services business.

BUYER PROFILE: ${BUY_BOX.buyer.background}
CAPITAL: ${BUY_BOX.buyer.capital}
BULLSEYE SECTORS: ${BUY_BOX.sector.bullseye.join(', ')}
ADJACENT (edge-case only): ${BUY_BOX.sector.adjacent.join(', ')}
SIZE: EBITDA floor $${BUY_BOX.size.ebitdaFloor.toLocaleString()} (${BUY_BOX.size.note}), ceiling $${BUY_BOX.size.ebitdaCeiling.toLocaleString()}
GEOGRAPHY: ${BUY_BOX.geography.note}
EXIT: ${BUY_BOX.exit}

Score against 7 DEAL-KILLER GATES, each ✅ (pass), ⚠️ (caution), ❌ (fail), or ? (unknown — and an unknown on a hard gate is itself a finding):
1. affordable — can she finance it on ~$150K equity + SBA + seller note?
2. key_man — does the business collapse when the owner leaves? (licenses held personally = ❌)
3. concentration — any single customer >25% of revenue = ❌
4. durability — AI/disruption resistant, essential service?
5. ebitda_quality — do stated addbacks make sense? Is margin believable? Is it EBITDA or SDE? (vague = ⚠️)
6. sba_eligible — is this business type SBA 7(a) eligible? (passive income, single-source revenue, recent losses = problems)
7. working_capital — significant WC needs at close? (slow AR, seasonal swings)

SIZE RANGE (the buy box): ~$300K–$1.5M EBITDA (use cash flow / SDE if EBITDA absent).

ZONE CLASSIFICATION — assign exactly one zone:
- CRITERIA_MATCH — a genuine water/well/septic/wastewater/water-treatment/water-utility/environmental/irrigation business, EBITDA (or SDE) roughly $300K–$1.5M, CO or Mountain West (or credibly remote-manageable), financeable. The bullseye.
- WATER_OUTSIDE_SPEND — a genuine water/environmental business, BUT its EBITDA/SDE is clearly outside $300K–$1.5M (too small, e.g. <$250K, or too large, e.g. >$2M) OR financials are undisclosed. Sector fits, size doesn't — worth a glance.
- SPEND_OUTSIDE_WATER — NOT a water business, BUT EBITDA/SDE is in $300K–$1.5M AND it is a genuinely enduring, durable, recession-resistant small business the ETA canon (Ruback/Yudkoff "dull is good," Deibel) would respect: HVAC, pest control, document storage, specialty/industrial distribution, B2B services, light/niche manufacturing, commercial services with recurring revenue. EXCLUDE from this zone (mark EXCLUDE instead): retail stores, liquor/convenience stores, restaurants/bars/cafes/food trucks, gas stations, e-commerce/Amazon/dropshipping, salons/spas, franchises of consumer fads, anything trendy or fragile.
- EXCLUDE — everything else: junk, asset/equipment-only sales, real-estate-only, wrong-sector-and-not-enduring, unfinanceable, or the consumer/retail categories above.

VERDICT (secondary, for the detail view): PURSUE (CRITERIA_MATCH, clean), DIG_DEEPER (CRITERIA_MATCH with a ⚠️ or missing data), EDGE_CASE (WATER_OUTSIDE_SPEND or SPEND_OUTSIDE_WATER), PASS (EXCLUDE).

CALIBRATION:
- The seller note bridges her equity gap; mark affordability ❌ only if genuinely unfinanceable, otherwise ⚠️.
- NEVER invent numbers. If EBITDA/concentration/owner-role isn't stated, mark "?" and make it a diligence question.
- Be skeptical on fit, but surface real water businesses generously — Breanna would rather review a tight-but-real water deal than have it hidden.

Return ONLY valid JSON, no markdown, matching exactly:
{
  "zone": "CRITERIA_MATCH|WATER_OUTSIDE_SPEND|SPEND_OUTSIDE_WATER|EXCLUDE",
  "verdict": "PURSUE|DIG_DEEPER|PASS|EDGE_CASE",
  "summary": "1-2 sentence card summary, specific to THIS deal",
  "missedDimension": "only if EDGE_CASE: what one dimension it misses, else null",
  "dealKillers": [{"label": "Affordable on her structure", "status": "✅|⚠️|❌|?", "note": "one sentence"}, ... all 7],
  "fitFactors": [{"label": "Sector fit", "value": "..."}, {"label": "Recurring revenue", "value": "..."}, {"label": "Operator fit", "value": "..."}, {"label": "Exit path", "value": "..."}],
  "topQuestions": ["3 highest-leverage diligence questions specific to this deal"],
  "scoreReasoning": "2-3 sentence overall rationale"
}`;

function listingToPrompt(l: Listing): string {
  const f = (label: string, v: unknown) => (v ? `${label}: ${v}\n` : '');
  return (
    `Score this BizBuySell listing:\n\n` +
    f('Title', l.title) +
    f('Location', l.location) +
    f('Sector', l.sector) +
    f('Asking price', l.askingPrice ? `$${l.askingPrice.toLocaleString()}` : null) +
    f('Revenue', l.revenue ? `$${l.revenue.toLocaleString()}` : null) +
    f('EBITDA', l.ebitda ? `$${l.ebitda.toLocaleString()}` : null) +
    f('Cash flow (SDE)', l.cashFlow ? `$${l.cashFlow.toLocaleString()}` : null) +
    f('Year established', l.yearEstablished) +
    f('Employees', l.employees) +
    f('Reason for selling', l.reasonForSelling) +
    f('Real estate', l.realEstate) +
    f('Financing', l.financing) +
    f('Broker', l.brokerFirm) +
    f('Description', l.description?.slice(0, 1500))
  );
}

const VALID_VERDICTS: Verdict[] = ['PURSUE', 'DIG_DEEPER', 'PASS', 'EDGE_CASE'];
const VALID_ZONES = ['CRITERIA_MATCH', 'WATER_OUTSIDE_SPEND', 'SPEND_OUTSIDE_WATER', 'EXCLUDE'] as const;

export async function scoreListing(listing: Listing): Promise<Score> {
  if (!config.anthropic.apiKey) throw new Error('ANTHROPIC_API_KEY not set — cannot score');

  const client = new Anthropic({ apiKey: config.anthropic.apiKey });
  const res = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 1500,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: listingToPrompt(listing) }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  // Extract JSON (model may wrap in ```json fences despite instructions)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in scoring response: ${text.slice(0, 200)}`);
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    throw new Error(`Malformed JSON in scoring response: ${jsonMatch[0].slice(0, 200)}`);
  }

  const verdict = String(parsed.verdict ?? '').toUpperCase().trim() as Verdict;
  if (!VALID_VERDICTS.includes(verdict)) {
    throw new Error(`Invalid verdict from model: ${parsed.verdict}`);
  }

  const zoneRaw = String(parsed.zone ?? '').toUpperCase().trim();
  const zone = (VALID_ZONES as readonly string[]).includes(zoneRaw)
    ? (zoneRaw as Score['zone'])
    : 'EXCLUDE';

  const missed = parsed.missedDimension;
  return {
    verdict,
    zone,
    summary: String(parsed.summary ?? ''),
    missedDimension: typeof missed === 'string' && missed ? missed : undefined,
    dealKillers: Array.isArray(parsed.dealKillers) ? (parsed.dealKillers as Score['dealKillers']) : [],
    fitFactors: Array.isArray(parsed.fitFactors) ? (parsed.fitFactors as Score['fitFactors']) : [],
    topQuestions: Array.isArray(parsed.topQuestions) ? (parsed.topQuestions as string[]) : [],
    scoreReasoning: String(parsed.scoreReasoning ?? ''),
  };
}

export { BUY_BOX_VERSION };
