// Source registry. The pipeline pulls from every enabled source and merges.
// Add new public sources here — they flow into the feed automatically.

import type { ScrapeSource, Listing } from './types';
import { craigslistSource } from './craigslist';
import { bizBuySellSource } from './bizbuysell';

const ALL_SOURCES: ScrapeSource[] = [craigslistSource, bizBuySellSource];

export function enabledSources(): ScrapeSource[] {
  return ALL_SOURCES.filter((s) => s.enabled());
}

// Scrape every enabled source. Per-source failures are isolated — one bad source
// doesn't sink the run. Returns merged listings + per-source counts + errors.
export async function scrapeAllSources(): Promise<{
  listings: Listing[];
  perSource: Record<string, number>;
  errors: string[];
}> {
  const perSource: Record<string, number> = {};
  const errors: string[] = [];
  const results = await Promise.all(
    enabledSources().map(async (src) => {
      try {
        const listings = await src.scrape();
        perSource[src.name] = listings.length;
        return listings;
      } catch (e) {
        errors.push(`${src.name}: ${(e as Error).message}`);
        perSource[src.name] = 0;
        return [] as Listing[];
      }
    })
  );
  return { listings: dedupeCrossSource(results.flat()), perSource, errors };
}

// Cross-source dedup: the SAME business listed twice → keep first, mark rest as
// duplicateOf. A match requires same listing URL, OR (same title AND a corroborating
// price within 10%). We do NOT collapse on title alone when price is unknown —
// generic titles ("Specialty Water Treatment") on distinct businesses with undisclosed
// prices were being wrongly merged, silently burying real deals.
export function dedupeCrossSource(listings: Listing[]): Listing[] {
  const kept: Listing[] = [];
  for (const l of listings) {
    const dup = kept.find(
      (k) =>
        k.listingUrl === l.listingUrl ||
        (titleKey(k.title) === titleKey(l.title) && priceClose(k.askingPrice, l.askingPrice))
    );
    if (dup) {
      l.duplicateOf = dup.id;
      console.log(`[dedup] "${l.title.slice(0, 40)}" marked duplicate of ${dup.id}`);
    }
    kept.push(l);
  }
  return kept;
}

function titleKey(t: string): string {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
}

// Only "close" when BOTH prices are known and within 10%. Unknown price = NOT a
// match (don't merge distinct businesses just because both hid their price).
function priceClose(a: number | null, b: number | null): boolean {
  if (a === null || b === null) return false;
  if (a === 0 || b === 0) return a === b;
  return Math.abs(a - b) / Math.max(a, b) <= 0.1; // within 10%
}
