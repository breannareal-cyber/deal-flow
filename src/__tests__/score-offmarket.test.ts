import { describe, it, expect } from 'vitest';
import { scoreOffMarket } from '@/lib/scoring/score-offmarket';
import { OFFMARKET_WEIGHTS } from '@/lib/scoring/buybox-config';
import { normalizeOffMarket } from '@/lib/scrapers/normalize';
import type { Listing } from '@/lib/types';

const NOW = 2026;

function candidate(over: Partial<Listing> = {}): Listing {
  const base = normalizeOffMarket({
    entityid: '1',
    entityname: 'TRUE PUMP & WELL SERVICE, INC.',
    entityformdate: '1972-03-31T00:00:00.000',
    principalcity: 'Denver',
    principalstate: 'CO',
  })!;
  return { ...base, ...over };
}

describe('scoreOffMarket', () => {
  it('returns an off-market Score with deterministic dimensions', () => {
    const s = scoreOffMarket(candidate(), NOW);
    expect(s.offMarket).toBeDefined();
    const dims = s.offMarket!.dimensions;
    for (const k of Object.keys(OFFMARKET_WEIGHTS)) {
      expect(dims[k]).toBeGreaterThanOrEqual(0);
      expect(dims[k]).toBeLessThanOrEqual(5);
    }
  });

  it('scores an old water business high on longevity & sector fit', () => {
    const s = scoreOffMarket(candidate(), NOW); // founded 1972 → 54 yrs, "pump & well"
    expect(s.offMarket!.dimensions.longevity).toBe(5);
    expect(s.offMarket!.dimensions.sectorFit).toBeGreaterThanOrEqual(4);
    expect(s.zone).toBe('CRITERIA_MATCH');
  });

  it('treats financial gates as unknowable (?) pre-contact', () => {
    const s = scoreOffMarket(candidate(), NOW);
    const byLabel = Object.fromEntries(s.dealKillers.map((d) => [d.label, d.status]));
    expect(byLabel['Affordable on her structure']).toBe('?');
    expect(byLabel['EBITDA quality']).toBe('?');
  });

  it('rewards stale sites with high modernization headroom', () => {
    const stale = scoreOffMarket(candidate({ siteLastUpdated: '2013-01-01' }), NOW);
    const fresh = scoreOffMarket(candidate({ siteLastUpdated: '2025-12-01' }), NOW);
    expect(stale.offMarket!.dimensions.modernizationHeadroom).toBeGreaterThan(
      fresh.offMarket!.dimensions.modernizationHeadroom
    );
  });

  it('sets upsideWithoutOwner only when modernization is high AND key-man risk is low', () => {
    // Provide an explicit low key-man signal via crew/staff hint on the listing.
    const flagged = scoreOffMarket(
      candidate({ siteLastUpdated: '2012-01-01', employees: 12 }),
      NOW
    );
    expect(flagged.offMarket!.dimensions.modernizationHeadroom).toBeGreaterThanOrEqual(4);
    expect(flagged.offMarket!.dimensions.keyManRisk).toBeLessThanOrEqual(2);
    expect(flagged.offMarket!.upsideWithoutOwner).toBe(true);

    // Solo operator, fresh site → not flagged.
    const notFlagged = scoreOffMarket(candidate({ siteLastUpdated: '2025-01-01', employees: 1 }), NOW);
    expect(notFlagged.offMarket!.upsideWithoutOwner).toBe(false);
  });

  it('weightedTotal responds to weight changes (weights are the lever)', () => {
    const c = candidate({ siteLastUpdated: '2012-01-01' });
    const normal = scoreOffMarket(c, NOW).offMarket!.weightedTotal;
    const reweighted = scoreOffMarket(c, NOW, { ...OFFMARKET_WEIGHTS, sectorFit: 0 }).offMarket!
      .weightedTotal;
    expect(reweighted).not.toBe(normal);
  });

  it('non-water business scores low sector fit and is not a criteria match', () => {
    const s = scoreOffMarket(candidate({ title: 'ROCKY MOUNTAIN ACCOUNTING LLC' }), NOW);
    expect(s.offMarket!.dimensions.sectorFit).toBeLessThanOrEqual(2);
    expect(s.zone).not.toBe('CRITERIA_MATCH');
  });

  // --- Web-enriched sector overrides the name-token guess (Task 4) ---

  it('demotes a name false-positive when enrichment says not_water (Elco case)', () => {
    // Name "DRILLING" alone would hit BULLSEYE → sectorFit 5. The web-resolved sector
    // says it is foundation drilling, not water → must be demoted.
    const s = scoreOffMarket(
      candidate({ title: 'ELCO DRILLING CO., INC.', enrichmentSector: 'not_water' }),
      NOW
    );
    expect(s.offMarket!.dimensions.sectorFit).toBe(1);
    expect(s.zone).toBe('EXCLUDE');
    expect(s.verdict).toBe('PASS');
  });

  it('promotes a generic-named business when enrichment confirms water', () => {
    // No water token in the name; the registry alone would score it low.
    const s = scoreOffMarket(
      candidate({ title: 'JOHNSON & SONS LLC', enrichmentSector: 'water' }),
      NOW
    );
    expect(s.offMarket!.dimensions.sectorFit).toBe(5);
    expect(s.zone).toBe('CRITERIA_MATCH');
  });

  it('water_adjacent enrichment scores a middling sector fit', () => {
    const s = scoreOffMarket(
      candidate({ title: 'FRONT RANGE SERVICES LLC', enrichmentSector: 'water_adjacent' }),
      NOW
    );
    expect(s.offMarket!.dimensions.sectorFit).toBe(3);
  });

  it("falls back to the name path when enrichment sector is unknown/absent", () => {
    const enriched = scoreOffMarket(candidate({ enrichmentSector: 'unknown' }), NOW);
    const plain = scoreOffMarket(candidate(), NOW);
    // "TRUE PUMP & WELL SERVICE" still scores on its name tokens, unchanged.
    expect(enriched.offMarket!.dimensions.sectorFit).toBe(plain.offMarket!.dimensions.sectorFit);
    expect(enriched.offMarket!.dimensions.sectorFit).toBeGreaterThanOrEqual(4);
  });
});
