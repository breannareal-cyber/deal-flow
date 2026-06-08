import { describe, it, expect } from 'vitest';
import { filterFeed } from '@/lib/feed-filter';
import type { StoredListing } from '@/lib/storage';
import { normalizeOffMarket, normalizeListing } from '@/lib/scrapers/normalize';

function offMarket(over: Partial<StoredListing> = {}): StoredListing {
  const base = normalizeOffMarket({ entityid: '1', entityname: 'TRUE PUMP CO', principalstate: 'CO' })!;
  return { ...base, score: null, research: null, stage: 'new', ...over } as StoredListing;
}
function listed(over: Partial<StoredListing> = {}): StoredListing {
  const base = normalizeListing({ title: 'Acme Septic', url: 'https://bizbuysell.com/x/99/' })!;
  return { ...base, score: null, research: null, stage: 'new', ...over } as StoredListing;
}

describe('filterFeed', () => {
  const feed = [
    offMarket({ id: 'a' }),
    listed({ id: 'b' }),
    offMarket({ id: 'c', stage: 'researching' }),
  ];

  it('returns everything when no filters are set', () => {
    expect(filterFeed(feed, {}).map((l) => l.id).sort()).toEqual(['a', 'b', 'c']);
  });

  it('filters by listing type', () => {
    expect(filterFeed(feed, { type: 'off_market' }).map((l) => l.id).sort()).toEqual(['a', 'c']);
    expect(filterFeed(feed, { type: 'listed' }).map((l) => l.id)).toEqual(['b']);
  });

  it('filters by stage (treating absent stage as "new")', () => {
    expect(filterFeed(feed, { stage: 'new' }).map((l) => l.id).sort()).toEqual(['a', 'b']);
    expect(filterFeed(feed, { stage: 'researching' }).map((l) => l.id)).toEqual(['c']);
  });

  it('filters by sector substring (case-insensitive, matches title too)', () => {
    expect(filterFeed(feed, { sector: 'septic' }).map((l) => l.id)).toEqual(['b']);
    expect(filterFeed(feed, { sector: 'pump' }).map((l) => l.id).sort()).toEqual(['a', 'c']);
  });

  it('combines filters', () => {
    expect(filterFeed(feed, { type: 'off_market', stage: 'new' }).map((l) => l.id)).toEqual(['a']);
  });
});
