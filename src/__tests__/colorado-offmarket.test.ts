import { describe, it, expect } from 'vitest';
import {
  fetchOffMarketCandidates,
  buildEntitiesQuery,
  offMarketSector,
} from '@/lib/scrapers/sources/colorado-offmarket';

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

  // Colorado's oldest water businesses are overwhelmingly drilling outfits, and the
  // source pages oldest-first — so without a cap every batch was all drilling. The
  // diversity pass caps each sub-sector (ceil(limit/4) = 1 at the default batch of 3)
  // so well/utility/quality companies get a slot.
  it('caps any one sub-sector so drilling cannot monopolize a batch', async () => {
    const mixed = [
      { entityid: 'd1', entityname: 'JAMES DRILLING CO.', entityformdate: '1957-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'd2', entityname: 'ELCO DRILLING CO., INC.', entityformdate: '1961-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'd3', entityname: 'CANFIELD DRILLING CO.', entityformdate: '1965-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'w1', entityname: 'YETTER WELL SERVICE, INC.', entityformdate: '1976-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 't1', entityname: 'DELOACH\'S WATER CONDITIONING, INC.', entityformdate: '1977-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
    ];
    const out = await fetchOffMarketCandidates({ limit: 3, existingIds: new Set(), fetchFn: pagedFetch(mixed) });
    expect(out).toHaveLength(3);
    const sectors = out.map((l) => offMarketSector(l.title));
    // At most one drilling slot, and the well + treatment companies both made the cut.
    expect(sectors.filter((s) => s === 'drilling')).toHaveLength(1);
    expect(out.map((l) => l.id)).toEqual(expect.arrayContaining(['co-sos-w1', 'co-sos-t1']));
  });

  // When only one sub-sector is available, the batch must still fill to `limit`
  // (the diversity cap backfills rather than under-serving).
  it('backfills from the pool when diversity alone cannot fill the batch', async () => {
    const allDrilling = [
      { entityid: 'd1', entityname: 'JAMES DRILLING CO.', entityformdate: '1957-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'd2', entityname: 'ELCO DRILLING CO., INC.', entityformdate: '1961-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'd3', entityname: 'CANFIELD DRILLING CO.', entityformdate: '1965-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
    ];
    const out = await fetchOffMarketCandidates({ limit: 3, existingIds: new Set(), fetchFn: pagedFetch(allDrilling) });
    expect(out).toHaveLength(3);
  });

  // Broadened keywords: water-quality / environmental / utility names were previously
  // unreachable (no matching keyword). They must now pass the water-business filter.
  it('surfaces water-quality, environmental, and utility companies (broadened net)', async () => {
    const broadened = [
      { entityid: 'q1', entityname: 'FRONT RANGE WATER QUALITY, INC.', entityformdate: '1995-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'e1', entityname: 'MILE HIGH ENVIRONMENTAL SERVICE LLC', entityformdate: '1998-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'u1', entityname: 'GLACIER VIEW WATER SYSTEM', entityformdate: '1968-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
    ];
    const out = await fetchOffMarketCandidates({ limit: 5, existingIds: new Set(), fetchFn: pagedFetch(broadened) });
    expect(out.map((l) => l.id)).toEqual(expect.arrayContaining(['co-sos-q1', 'co-sos-e1', 'co-sos-u1']));
  });
});

describe('offMarketSector', () => {
  it('classifies the water sub-sectors used for batch diversity', () => {
    expect(offMarketSector('JAMES DRILLING CO.')).toBe('drilling');
    expect(offMarketSector('FRONT RANGE WATER QUALITY, INC.')).toBe('quality-env');
    expect(offMarketSector('MILE HIGH ENVIRONMENTAL SERVICE LLC')).toBe('quality-env');
    expect(offMarketSector('GLACIER VIEW WATER SYSTEM')).toBe('treatment-utility');
    expect(offMarketSector('ACME SANITARY & SEWER SERVICE, INC.')).toBe('septic-sewer');
    expect(offMarketSector('TRUE PUMP & EQUIPMENT, INC.')).toBe('pump');
    expect(offMarketSector('YETTER WELL SERVICE, INC.')).toBe('well');
  });
});
