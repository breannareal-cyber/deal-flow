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
});
