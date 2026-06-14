import { describe, it, expect } from 'vitest';
import {
  fetchOffMarketCandidates,
  buildEntitiesQuery,
  offMarketSector,
  rotatingOrderDir,
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

  // Drilling companies are excluded entirely (product decision) — even though
  // water-well drilling is nominally the bullseye. They must never reach the batch.
  it('excludes drilling companies entirely', async () => {
    const mixed = [
      { entityid: 'd1', entityname: 'JAMES DRILLING CO.', entityformdate: '1957-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'd2', entityname: 'ELCO DRILLING CO., INC.', entityformdate: '1961-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'w1', entityname: 'YETTER WELL SERVICE, INC.', entityformdate: '1976-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 't1', entityname: 'DELOACH\'S WATER CONDITIONING, INC.', entityformdate: '1977-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
    ];
    const out = await fetchOffMarketCandidates({ limit: 3, existingIds: new Set(), fetchFn: pagedFetch(mixed) });
    expect(out.map((l) => offMarketSector(l.title))).not.toContain('drilling');
    expect(out.map((l) => l.id)).toEqual(expect.arrayContaining(['co-sos-w1', 'co-sos-t1']));
    // The drilling outfits are gone.
    expect(out.map((l) => l.id)).not.toContain('co-sos-d1');
  });

  // When only one sub-sector is available, the batch must still fill to `limit`
  // (the diversity cap backfills rather than under-serving).
  it('backfills from the pool when diversity alone cannot fill the batch', async () => {
    const allPump = [
      { entityid: 'p1', entityname: 'TRUE PUMP & EQUIPMENT, INC.', entityformdate: '1957-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'p2', entityname: 'CULLUM PUMPING SERVICE, INC.', entityformdate: '1961-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
      { entityid: 'p3', entityname: 'LIVING WATER PUMP SERVICE, INC.', entityformdate: '1965-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
    ];
    const out = await fetchOffMarketCandidates({ limit: 3, existingIds: new Set(), fetchFn: pagedFetch(allPump) });
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

// Oldest-first every run surfaced the same antique drilling cohort ("same
// businesses over and over"). The cron alternates sort direction by date parity so
// later/more-diverse businesses also get airtime; dedup still prevents repeats.
describe('rotating sort direction (anti-monotony)', () => {
  // Order-aware Socrata stub: honors $order=entityformdate asc|desc like the real API.
  function orderedFetch(rows: Record<string, unknown>[]): typeof fetch {
    let served = false;
    return (async (url: string) => {
      if (served) return { ok: true, json: async () => [] };
      served = true;
      const desc = /entityformdate(%20|\s)desc/i.test(url);
      const sorted = [...rows].sort((a, b) => {
        const av = String(a.entityformdate), bv = String(b.entityformdate);
        return desc ? bv.localeCompare(av) : av.localeCompare(bv);
      });
      return { ok: true, json: async () => sorted };
    }) as unknown as typeof fetch;
  }

  const MIXED = [
    { entityid: 'o1', entityname: 'YETTER WELL SERVICE, INC.', entityformdate: '1957-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
    { entityid: 'o2', entityname: 'TRUE PUMP & EQUIPMENT, INC.', entityformdate: '1972-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
    { entityid: 'n1', entityname: 'FRONT RANGE WATER QUALITY, INC.', entityformdate: '2015-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
    { entityid: 'n2', entityname: 'GLACIER VIEW WATER SYSTEM', entityformdate: '2018-01-01', principalstate: 'CO', entitystatus: 'Good Standing' },
  ];

  it('asc surfaces the oldest, desc surfaces the newest (different cohorts)', async () => {
    const asc = await fetchOffMarketCandidates({ limit: 2, existingIds: new Set(), fetchFn: orderedFetch(MIXED), orderDir: 'asc' });
    const desc = await fetchOffMarketCandidates({ limit: 2, existingIds: new Set(), fetchFn: orderedFetch(MIXED), orderDir: 'desc' });
    expect(asc.map((l) => l.id)).toEqual(expect.arrayContaining(['co-sos-o1']));
    expect(desc.map((l) => l.id)).toEqual(expect.arrayContaining(['co-sos-n2']));
    // The two runs are not the same set — monotony broken.
    expect(asc.map((l) => l.id)).not.toEqual(desc.map((l) => l.id));
  });

  it('defaults to asc when no direction is given (back-compat)', async () => {
    const out = await fetchOffMarketCandidates({ limit: 1, existingIds: new Set(), fetchFn: orderedFetch(MIXED) });
    expect(out[0].id).toBe('co-sos-o1'); // oldest
  });

  it('rotatingOrderDir alternates on the every-other-day cron cadence', () => {
    // Consecutive cron fire dates must not pick the same direction.
    const d1 = rotatingOrderDir(new Date('2026-06-14T14:00:00Z'));
    const d2 = rotatingOrderDir(new Date('2026-06-16T14:00:00Z'));
    expect(d1).not.toBe(d2);
    expect(['asc', 'desc']).toContain(d1);
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
