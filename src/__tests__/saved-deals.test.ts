import { describe, it, expect } from 'vitest';
import { savedDeals, groupHold, SAVED_STAGES } from '@/lib/feed-filter';
import type { StoredListing } from '@/lib/storage';
import { normalizeOffMarket } from '@/lib/scrapers/normalize';

function deal(over: Partial<StoredListing> = {}): StoredListing {
  const base = normalizeOffMarket({ entityid: String(Math.random()), entityname: 'TRUE PUMP CO', principalstate: 'CO' })!;
  return { ...base, score: null, research: null, stage: 'new', starred: false, ...over } as StoredListing;
}

describe('savedDeals', () => {
  const feed = [
    deal({ id: 'new1', stage: 'new', scrapedAt: '2026-06-01T00:00:00Z' }),
    deal({ id: 'res1', stage: 'researching', scrapedAt: '2026-06-02T00:00:00Z' }),
    deal({ id: 'con1', stage: 'contacted', scrapedAt: '2026-06-04T00:00:00Z' }),
    deal({ id: 'pass1', stage: 'passed', scrapedAt: '2026-06-03T00:00:00Z' }),
    deal({ id: 'dead1', stage: 'dead', scrapedAt: '2026-06-05T00:00:00Z' }),
  ];

  it('keeps researched / contacted / passed (drops new and dead)', () => {
    expect(savedDeals(feed).map((l) => l.id).sort()).toEqual(['con1', 'pass1', 'res1']);
  });

  it('returns newest first by scrapedAt', () => {
    expect(savedDeals(feed).map((l) => l.id)).toEqual(['con1', 'pass1', 'res1']);
  });

  it('treats absent stage as "new" (excluded)', () => {
    const noStage = deal({ id: 'x' });
    delete (noStage as { stage?: unknown }).stage;
    expect(savedDeals([noStage])).toEqual([]);
  });

  it('includes a starred deal even when its stage is still "new"', () => {
    const star = deal({ id: 'star-new', stage: 'new', starred: true });
    expect(savedDeals([star]).map((l) => l.id)).toEqual(['star-new']);
  });

  it('SAVED_STAGES is exactly the three tracked dispositions', () => {
    expect([...SAVED_STAGES].sort()).toEqual(['contacted', 'passed', 'researching']);
  });
});

describe('groupHold', () => {
  const feed = [
    deal({ id: 'res1', stage: 'researching' }),
    deal({ id: 'res2', stage: 'researching' }),
    deal({ id: 'con1', stage: 'contacted' }),
    deal({ id: 'new1', stage: 'new' }),
    deal({ id: 'star1', stage: 'new', starred: true }),
    deal({ id: 'starcon', stage: 'contacted', starred: true }),
  ];

  it('floats every starred deal into the starred bucket (top), regardless of stage', () => {
    const g = groupHold(feed);
    expect(g.starred.map((l) => l.id).sort()).toEqual(['star1', 'starcon']);
  });

  it('excludes starred deals from their disposition bucket (no duplication)', () => {
    const g = groupHold(feed);
    // starcon is contacted+starred -> only in starred, not contacted
    expect(g.contacted.map((l) => l.id)).toEqual(['con1']);
    expect(g.researching.map((l) => l.id).sort()).toEqual(['res1', 'res2']);
    expect(g.passed).toEqual([]);
  });

  it('omits plain "new" deals entirely', () => {
    const g = groupHold(feed);
    const allIds = [...g.starred, ...g.researching, ...g.contacted, ...g.passed].map((l) => l.id);
    expect(allIds).not.toContain('new1');
  });
});
