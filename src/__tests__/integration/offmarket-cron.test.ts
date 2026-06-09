import { describe, it, expect } from 'vitest';
import { runOffMarketScrape } from '@/lib/pipeline';
import type { Storage, StoredListing } from '@/lib/storage';
import type { ScoredListing, Score, Listing } from '@/lib/types';
import { savedDeals } from '@/lib/feed-filter';

// In-memory storage (boundary stub) implementing the full interface.
function memStore(): Storage & { all: () => StoredListing[] } {
  const db = new Map<string, StoredListing>();
  return {
    all: () => [...db.values()],
    async getById(id) { return db.get(id) ?? null; },
    async upsertListings(ls: ScoredListing[]) {
      let added = 0;
      for (const l of ls) { if (!db.has(l.id)) added++; db.set(l.id, { ...l } as StoredListing); }
      return added;
    },
    async saveScore(id: string, score: Score) { const l = db.get(id); if (l) l.score = score; },
    async setStatus(id, status) { const l = db.get(id); if (l) l.pipelineStatus = status; },
    async getExistingIds(prefix?: string) {
      return new Set([...db.keys()].filter((k) => (prefix ? k.startsWith(prefix) : true)));
    },
    async getByStatus() { return []; },
    async saveResearch() {},
    async recordFailure() {},
    async getFeed() { return []; },
    async getSaved() { return savedDeals([...db.values()]); },
    async setStage() {},
    async setStar() {},
    async count() { return db.size; },
  } as Storage & { all: () => StoredListing[] };
}

const ROWS = [
  { entityid: '1', entityname: 'TRUE PUMP & EQUIPMENT, INC.', entityformdate: '1972-03-31', principalcity: 'Denver', principalstate: 'CO', entitystatus: 'Good Standing' },
  { entityid: '2', entityname: 'B AND J PUMP AND WELL SERVICE, INC.', entityformdate: '1983-01-01', principalcity: 'Steamboat', principalstate: 'CO', entitystatus: 'Good Standing' },
  { entityid: '3', entityname: 'CULLUM PUMPING SERVICE, INC.', entityformdate: '1988-01-01', principalcity: 'Cortez', principalstate: 'CO', entitystatus: 'Good Standing' },
  { entityid: '4', entityname: 'LIVING WATER PUMP SERVICE, INC.', entityformdate: '1989-01-01', principalcity: 'Pine', principalstate: 'CO', entitystatus: 'Good Standing' },
  { entityid: '5', entityname: 'PYRAMID WATER SYSTEMS, INC.', entityformdate: '1990-01-01', principalcity: 'Broomfield', principalstate: 'CO', entitystatus: 'Good Standing' },
  { entityid: '6', entityname: 'GROUND WATER SYSTEMS, LLC', entityformdate: '1993-01-01', principalcity: 'Fort Lupton', principalstate: 'CO', entitystatus: 'Good Standing' },
];

// Fetch that serves the remaining (not-yet-seen) rows once, then empties — so two
// runs against the same store naturally surface different candidates.
function liveLikeFetch(rows: Record<string, unknown>[]): typeof fetch {
  let page = 0;
  return (async () => {
    const body = page === 0 ? rows : [];
    page++;
    return { ok: true, json: async () => body };
  }) as unknown as typeof fetch;
}

const noEnrich = async (l: Listing) => l; // skip network in tests

describe('runOffMarketScrape (cron flow)', () => {
  it('surfaces ≤ batch new candidates, scores and stores them', async () => {
    const store = memStore();
    const res = await runOffMarketScrape({ storage: store, fetchFn: liveLikeFetch(ROWS), enrich: noEnrich });
    expect(res.added).toBeLessThanOrEqual(3); // OFFMARKET_BATCH default
    expect(res.scored).toBe(res.added);
    expect(store.all()).toHaveLength(res.added);
    expect(store.all().every((l) => l.pipelineStatus === 'scored' && l.score)).toBe(true);
  });

  it('a second run surfaces DIFFERENT candidates (never re-serves the first batch)', async () => {
    const store = memStore();
    await runOffMarketScrape({ storage: store, fetchFn: liveLikeFetch(ROWS), enrich: noEnrich });
    const firstIds = store.all().map((l) => l.id);
    const second = await runOffMarketScrape({ storage: store, fetchFn: liveLikeFetch(ROWS), enrich: noEnrich });
    const secondIds = store.all().map((l) => l.id).filter((id) => !firstIds.includes(id));
    expect(second.added).toBeGreaterThan(0);
    // No overlap between the two batches.
    expect(secondIds).toHaveLength(second.added);
    expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
  });
});
