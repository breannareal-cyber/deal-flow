import type { StoredListing } from '@/lib/storage';
import type { Stage } from '@/lib/types';

// The three tracked dispositions that land a deal in The Hold. 'new' is still in the
// hunt; 'dead' is permanently dismissed — neither belongs in the saved area.
export const SAVED_STAGES = ['researching', 'contacted', 'passed'] as const;
export type SavedStage = (typeof SAVED_STAGES)[number];

function isSaved(stage: Stage): stage is SavedStage {
  return (SAVED_STAGES as readonly string[]).includes(stage);
}

// Deals that belong in The Hold: anything starred (a favorite, independent of
// disposition) OR marked Researched / Contacted / Pass. Newest first. Pure +
// testable; both the storage layer and The Hold page select through this.
export function savedDeals(listings: StoredListing[]): StoredListing[] {
  return listings
    .filter((l) => l.starred || isSaved(l.stage ?? 'new'))
    .sort((a, b) => (b.scrapedAt > a.scrapedAt ? 1 : -1));
}

// The Hold's sections, in display order. Starred floats to the top regardless of
// disposition and is pulled OUT of its disposition bucket so it appears exactly once.
export function groupHold(listings: StoredListing[]): {
  starred: StoredListing[];
} & Record<SavedStage, StoredListing[]> {
  const saved = savedDeals(listings);
  const byStage = (s: SavedStage) =>
    saved.filter((l) => !l.starred && (l.stage ?? 'new') === s);
  return {
    starred: saved.filter((l) => l.starred),
    researching: byStage('researching'),
    contacted: byStage('contacted'),
    passed: byStage('passed'),
  };
}

export type FeedFilters = {
  type?: string | null; // 'off_market' | 'listed'
  stage?: string | null; // a Stage value
  sector?: string | null; // case-insensitive substring on sector or title
};

// Pure feed filter (testable). Empty/absent filters are no-ops.
export function filterFeed(listings: StoredListing[], f: FeedFilters): StoredListing[] {
  const sector = f.sector?.trim().toLowerCase();
  return listings.filter((l) => {
    if (f.type && l.listingType !== f.type) return false;
    if (f.stage && (l.stage ?? 'new') !== f.stage) return false;
    if (sector) {
      const hay = `${l.sector ?? ''} ${l.title}`.toLowerCase();
      if (!hay.includes(sector)) return false;
    }
    return true;
  });
}
