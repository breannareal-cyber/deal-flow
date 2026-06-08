import type { StoredListing } from '@/lib/storage';

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
