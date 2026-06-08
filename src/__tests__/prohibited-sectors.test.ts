import { describe, it, expect } from 'vitest';
import { isProhibited } from '@/lib/scoring/buybox-config';
import { scoreOffMarket } from '@/lib/scoring/score-offmarket';
import { scoreListing } from '@/lib/scoring/score-listing';
import { normalizeOffMarket } from '@/lib/scrapers/normalize';
import type { Listing } from '@/lib/types';

function offMarket(over: Partial<Listing> = {}): Listing {
  const base = normalizeOffMarket({ entityid: '1', entityname: 'X', principalstate: 'CO' })!;
  return { ...base, ...over };
}

describe('isProhibited', () => {
  it('flags guns / jewelry / liquor / laundromats', () => {
    expect(isProhibited('Mountain Gun Shop')).toBe(true);
    expect(isProhibited(null, 'Pawn & Jewelry')).toBe(true);
    expect(isProhibited('Denver Liquor Mart')).toBe(true);
    expect(isProhibited('Spin Cycle Laundromat')).toBe(true);
  });

  it('does NOT flag HVAC — it is an adjacent sector, not prohibited', () => {
    expect(isProhibited('Front Range HVAC & Heating')).toBe(false);
  });

  it('does NOT flag water businesses', () => {
    expect(isProhibited('True Pump & Well Service')).toBe(false);
  });
});

describe('scoreOffMarket — prohibited short-circuit', () => {
  it('hard-excludes a prohibited candidate before scoring (no offMarket dimensions)', () => {
    const s = scoreOffMarket(offMarket({ title: 'ROCKY MOUNTAIN GUN & AMMO LLC' }), 2026);
    expect(s.zone).toBe('EXCLUDE');
    expect(s.verdict).toBe('PASS');
    expect(s.offMarket).toBeUndefined();
  });

  it('still scores HVAC as an adjacent candidate (not excluded)', () => {
    const s = scoreOffMarket(offMarket({ title: 'FRONT RANGE HVAC INC', yearEstablished: 1985 }), 2026);
    expect(s.zone).not.toBe('EXCLUDE');
    expect(s.offMarket).toBeDefined();
    expect(s.offMarket!.dimensions.sectorFit).toBe(3); // adjacent
  });
});

describe('scoreListing — prohibited short-circuit', () => {
  it('excludes a prohibited listing WITHOUT needing an API key (check runs first)', async () => {
    // No ANTHROPIC key needed: the prohibited check returns before the key guard.
    const listing = { ...offMarket({ title: 'Denver Liquor & Spirits' }), listingType: 'listed' as const };
    const s = await scoreListing(listing);
    expect(s.zone).toBe('EXCLUDE');
    expect(s.verdict).toBe('PASS');
  });
});
