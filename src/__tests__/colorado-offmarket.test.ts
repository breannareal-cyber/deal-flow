import { describe, it, expect } from 'vitest';
import { fetchOffMarketCandidates, buildEntitiesQuery } from '@/lib/scrapers/sources/colorado-offmarket';

// Canned Socrata rows (real field names from the Task 0 spike).
const ROWS = [
  { entityid: '1', entityname: 'TRUE PUMP & EQUIPMENT, INC.', entityformdate: '1972-03-31T00:00:00.000', principalcity: 'Denver', principalstate: 'CO', entitytype: 'DPC', entitystatus: 'Good Standing' },
  { entityid: '2', entityname: 'B AND J PUMP AND WELL SERVICE, INC.', entityformdate: '1983-01-01T00:00:00.000', principalcity: 'Steamboat', principalstate: 'CO', entitytype: 'DPC', entitystatus: 'Good Standing' },
  { entityid: '3', entityname: 'CULLUM PUMPING SERVICE, INC.', entityformdate: '1988-01-01T00:00:00.000', principalcity: 'Cortez', principalstate: 'CO', entitytype: 'DPC', entitystatus: 'Good Standing' },
  { entityid: '4', entityname: 'LIVING WATER PUMP SERVICE, INC.', entityformdate: '1989-01-01T00:00:00.000', principalcity: 'Pine', principalstate: 'CO', entitytype: 'DPC', entitystatus: 'Good Standing' },
];

function pagedFetch(rows: Record<string, unknown>[]): typeof fetch {
  // One page then empty (the source pages until it has enough new + cap).
  let served = false;
  return (async () => {
    const body = served ? [] : rows;
    served = true;
    return { ok: true, json: async () => body };
  }) as unknown as typeof fetch;
}

describe('buildEntitiesQuery', () => {
  it('includes the negative-filter (excludes irrigation/ditch/district co-ops)', () => {
    const q = buildEntitiesQuery();
    expect(q.toUpperCase()).toContain('NOT LIKE');
    expect(q.toUpperCase()).toContain('IRRIGATION');
    expect(q.toUpperCase()).toContain('DISTRICT');
    expect(q.toUpperCase()).toContain('GOOD'); // good standing
  });

  it('applies a formation-date floor (skips pre-1950 mutual water companies)', () => {
    expect(buildEntitiesQuery()).toContain('1950');
  });
});

describe('fetchOffMarketCandidates', () => {
  it('returns at most `limit` brand-new off-market listings', async () => {
    const out = await fetchOffMarketCandidates({
      limit: 3,
      existingIds: new Set(),
      fetchFn: pagedFetch(ROWS),
    });
    expect(out).toHaveLength(3);
    expect(out.every((l) => l.listingType === 'off_market')).toBe(true);
    expect(out.every((l) => l.source === 'co-sos')).toBe(true);
  });

  it('skips ids already surfaced (never re-serves a dismissed candidate)', async () => {
    const out = await fetchOffMarketCandidates({
      limit: 3,
      existingIds: new Set(['co-sos-1', 'co-sos-2']),
      fetchFn: pagedFetch(ROWS),
    });
    expect(out.map((l) => l.id)).toEqual(['co-sos-3', 'co-sos-4']); // 1 & 2 skipped
  });

  it('drops pre-1950 entities (1890s mutual water companies are not acquirable)', async () => {
    const withOldCoop = [
      { entityid: '8', entityname: 'THE WATER SUPPLY AND STORAGE COMPANY', entityformdate: '1891-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      ...ROWS,
    ];
    const out = await fetchOffMarketCandidates({ limit: 5, existingIds: new Set(), fetchFn: pagedFetch(withOldCoop) });
    expect(out.find((l) => l.id === 'co-sos-8')).toBeUndefined();
  });

  it('drops rows that fail the word-boundary water filter (no PUMPkin)', async () => {
    const noise = [
      { entityid: '9', entityname: 'ROCKY MOUNTAIN PUMPKIN RANCH INC.', entityformdate: '1993-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      ...ROWS,
    ];
    const out = await fetchOffMarketCandidates({ limit: 5, existingIds: new Set(), fetchFn: pagedFetch(noise) });
    expect(out.find((l) => l.id === 'co-sos-9')).toBeUndefined();
  });

  it('returns [] without throwing when the API yields nothing', async () => {
    const out = await fetchOffMarketCandidates({ limit: 3, existingIds: new Set(), fetchFn: pagedFetch([]) });
    expect(out).toEqual([]);
  });
});
