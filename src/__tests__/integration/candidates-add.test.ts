import { describe, it, expect } from 'vitest';
import { addCandidateByUrl } from '@/lib/candidates/add';
import type { Storage, StoredListing } from '@/lib/storage';
import type { ScoredListing, Score } from '@/lib/types';
import { savedDeals } from '@/lib/feed-filter';

// Minimal in-memory storage (boundary stub) — only the methods add uses.
function memStore(): Storage & { all: () => StoredListing[] } {
  const db = new Map<string, StoredListing>();
  return {
    all: () => [...db.values()],
    async getById(id) {
      return db.get(id) ?? null;
    },
    async upsertListings(listings: ScoredListing[]) {
      let added = 0;
      for (const l of listings) {
        if (!db.has(l.id)) added++;
        db.set(l.id, { ...l } as StoredListing);
      }
      return added;
    },
    async saveScore(id: string, score: Score) {
      const l = db.get(id);
      if (l) l.score = score;
    },
    async setStatus(id, status) {
      const l = db.get(id);
      if (l) l.pipelineStatus = status;
    },
    // unused by add — present to satisfy the interface
    async getExistingIds() { return new Set<string>(); },
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

const stubEnrich = async (l: ScoredListing) => ({ ...l, siteLastUpdated: '2013-01-01' });

describe('addCandidateByUrl', () => {
  it('adds, enriches, and scores an off-market candidate from a URL', async () => {
    const store = memStore();
    const res = await addCandidateByUrl('https://www.truepump.com/', { storage: store, enrich: stubEnrich });
    if (!res.ok) throw new Error(res.error);
    expect(res.listing.listingType).toBe('off_market');
    expect(res.listing.source).toBe('manual');
    expect(res.listing.score).not.toBeNull();
    expect(store.all()).toHaveLength(1);
    expect(store.all()[0].pipelineStatus).toBe('scored');
  });

  it('rejects an invalid URL with 400', async () => {
    const store = memStore();
    const res = await addCandidateByUrl('not a url', { storage: store, enrich: stubEnrich });
    if (res.ok) throw new Error('expected failure');
    expect(res.status).toBe(400);
    expect(store.all()).toHaveLength(0);
  });

  it('is idempotent — same site added twice yields one record', async () => {
    const store = memStore();
    await addCandidateByUrl('https://truepump.com', { storage: store, enrich: stubEnrich });
    const second = await addCandidateByUrl('http://www.truepump.com/contact', { storage: store, enrich: stubEnrich });
    expect(store.all()).toHaveLength(1);
    if (!second.ok) throw new Error(second.error);
    expect(second.added).toBe(false);
  });
});
