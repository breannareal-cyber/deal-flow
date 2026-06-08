import type { Listing } from '@/lib/types';

// A scrape source. Each returns normalized Listings. Sources self-report whether
// they're enabled (e.g. BizBuySell needs APIFY_TOKEN; Craigslist is always on).
export interface ScrapeSource {
  name: string;
  enabled: () => boolean;
  scrape: () => Promise<Listing[]>;
}

export type { Listing };
