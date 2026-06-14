import { describe, it, expect } from 'vitest';
import { backfillOffMarketEnrichment } from '@/lib/pipeline';
import type { Storage, StoredListing } from '@/lib/storage';
import type { ScoredListing, Score, Listing } from '@/lib/types';
import { normalizeOffMarket } from '@/lib/scrapers/normalize';

// In-memory store whose getByStatus actually returns seeded listings (the backfill
// enumerates stored off-market candidates that were scored before enrichment existed).
function memStore(seed: StoredListing[] = []): Storage & { all: () => StoredListing[] } {
  const db = new Map<string, StoredListing>(seed.map((l) => [l.id, { ...l }]));
  return {
    all: () => [...db.values()],
    async getById(id) { return db.get(id) ?? null; },
    async upsertListings(ls: ScoredListing[]) {
      for (const l of ls) db.set(l.id, { ...(db.get(l.id) ?? {}), ...l } as StoredListing);
      return ls.length;
    },
    async saveScore(id: string, score: Score) { const l = db.get(id); if (l) l.score = score; },
    async setStatus(id, status) { const l = db.get(id); if (l) l.pipelineStatus = status; },
    async getExistingIds(prefix?: string) { return new Set([...db.keys()].filter((k) => (prefix ? k.startsWith(prefix) : true))); },
    async getByStatus(status) { return [...db.values()].filter((l) => l.pipelineStatus === status); },
    async saveResearch() {},
    async recordFailure() {},
    async getFeed() { return [...db.values()]; },
    async getSaved() { return []; },
    async setStage() {},
    async setStar() {},
    async count() { return db.size; },
  } as Storage & { all: () => StoredListing[] };
}

// A stored off-market listing as it exists today: scored, but never web-enriched.
function stored(entityid: string, entityname: string): StoredListing {
  const base = normalizeOffMarket({ entityid, entityname, entityformdate: '1975-01-01', principalcity: 'Denver', principalstate: 'CO' })!;
  return { ...base, pipelineStatus: 'scored', score: { verdict: 'DIG_DEEPER', zone: 'CRITERIA_MATCH', summary: '', dealKillers: [], fitFactors: [], topQuestions: [], scoreReasoning: '' }, research: null } as StoredListing;
}

describe('backfillOffMarketEnrichment', () => {
  it('enriches stored off-market listings that were never web-enriched, then re-scores', async () => {
    const store = memStore([stored('1', 'ARROW DRILLING COMPANY'), stored('2', 'PINE JUNCTION WATER SYSTEM, INC.')]);
    // Enrich stub: classify #2 as a non-water subdivision system; #1 as not_water (drilling).
    const enrich = async (l: Listing): Promise<Listing> => ({
      ...l,
      website: 'https://example.com',
      businessDescription: 'desc',
      enrichmentSector: l.title.includes('PINE') ? 'not_water' : 'not_water',
      fieldSources: { ...(l.fieldSources ?? {}), enrichmentSector: 'enriched' },
    });

    const res = await backfillOffMarketEnrichment({ storage: store, enrich, limit: 10 });

    expect(res.enriched).toBe(2);
    // Both now carry the web-derived sector and a re-computed score.
    const all = store.all();
    expect(all.every((l) => l.enrichmentSector === 'not_water')).toBe(true);
    // Re-scored: not_water → low sector fit → no longer CRITERIA_MATCH.
    expect(all.every((l) => l.score?.zone !== 'CRITERIA_MATCH')).toBe(true);
  });

  it('skips listings already web-enriched (idempotent / cost guard)', async () => {
    const already = stored('3', 'TRUE PUMP & EQUIPMENT, INC.');
    already.fieldSources = { ...already.fieldSources, enrichmentSector: 'enriched' };
    already.enrichmentSector = 'water';
    const store = memStore([already]);
    let calls = 0;
    const enrich = async (l: Listing) => { calls++; return l; };

    const res = await backfillOffMarketEnrichment({ storage: store, enrich, limit: 10 });

    expect(calls).toBe(0);
    expect(res.enriched).toBe(0);
  });

  it('respects the per-run limit (bounded cost)', async () => {
    const store = memStore([stored('1', 'A WELL CO'), stored('2', 'B WELL CO'), stored('3', 'C WELL CO')]);
    const enrich = async (l: Listing): Promise<Listing> => ({ ...l, enrichmentSector: 'water', fieldSources: { ...(l.fieldSources ?? {}), enrichmentSector: 'enriched' } });

    const res = await backfillOffMarketEnrichment({ storage: store, enrich, limit: 2 });

    expect(res.enriched).toBe(2); // only 2 of 3 this run
  });

  it('does not touch listed (non-off-market) listings', async () => {
    const listed: StoredListing = { ...stored('x', 'SOME BIZ'), listingType: 'listed', source: 'bizbuysell' } as StoredListing;
    const store = memStore([listed]);
    let calls = 0;
    const enrich = async (l: Listing) => { calls++; return l; };

    const res = await backfillOffMarketEnrichment({ storage: store, enrich, limit: 10 });

    expect(calls).toBe(0);
    expect(res.enriched).toBe(0);
  });
});
