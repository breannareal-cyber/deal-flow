// BizBuySell scraper via Apify (shahidirfan actor). The actor only honors ONE
// startUrl per run and its keyword filter is broken — but STATE filtering works.
// So we run one scrape per state (in parallel), then pre-filter to water/
// environmental in-code. Claude does the real semantic classification downstream.

import { config, matchesWaterFilter, inSpendRange } from '@/lib/config';
import type { Listing } from '@/lib/types';
import { normalizeListing } from './normalize';

async function runOnce(url: string): Promise<Record<string, unknown>[]> {
  const { token, actorId } = config.apify;
  // Sync timeout 100s: normal runs complete in 60-90s; 100s gives a safe buffer
  // while guaranteeing the scrape stage finishes well under the 300s function limit.
  const endpoint = `https://api.apify.com/v2/acts/${actorId}/run-sync-get-dataset-items?token=${token}&timeout=100`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startUrls: [{ url }],
      results_wanted: config.bizbuysell.resultsPerState,
      proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] },
    }),
  });
  if (!res.ok) throw new Error(`Apify ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const rows = await res.json();
  return Array.isArray(rows) ? rows : [];
}

// Individual Apify runs are transiently flaky (run-failed / empty via residential
// proxy ECONNRESET). Retry so a single bad run doesn't drop a whole state. We treat
// thrown errors and empty results differently:
//   - thrown error → clearly transient → retry up to maxAttempts
//   - empty result → could be a genuinely empty state → retry ONCE, then accept []
// This bounds cost (no endless empty-retries) and keeps total attempts ≤ maxAttempts.
async function scrapeState(url: string): Promise<Record<string, unknown>[]> {
  const maxAttempts = Number(process.env.BIZBUYSELL_RETRIES ?? 2);
  let emptyRetried = false;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const rows = await runOnce(url);
      if (rows.length > 0) return rows;
      if (emptyRetried) return []; // already retried an empty once — accept it
      emptyRetried = true;
      lastErr = new Error('returned 0 listings');
    } catch (e) {
      lastErr = e;
    }
    if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 1500));
  }
  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

// Run tasks with a max concurrency. Firing all 6 state run-sync calls at once made
// Run state scrapes with a concurrency cap. NOTE: concurrent Apify run-sync calls
// are unreliable — some silently return empty (this is how Wyoming, and its
// water-treatment company, vanished from a whole run). We default to 1 (sequential)
// for reliable per-state coverage; 2 states fit easily in the time budget.
async function withConcurrency<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const batch = items.slice(i, i + limit);
    results.push(...(await Promise.allSettled(batch.map(fn))));
  }
  return results;
}

export async function scrapeBizBuySell(): Promise<Listing[]> {
  const { token } = config.apify;
  if (!token) throw new Error('APIFY_TOKEN not set — cannot scrape');

  // Sequential by default — see note above. Override with BIZBUYSELL_CONCURRENCY.
  const concurrency = Number(process.env.BIZBUYSELL_CONCURRENCY ?? 1);
  const urls = config.bizbuysell.stateUrls;
  const perState = await withConcurrency(urls, concurrency, scrapeState);

  // Surface per-state outcomes so a silently-empty/failed state can't hide again.
  perState.forEach((r, i) => {
    const state = urls[i].match(/\/([a-z-]+)-businesses/)?.[1] ?? urls[i];
    if (r.status === 'rejected') {
      console.warn(`[scrape] ${state}: FAILED — ${r.reason?.message ?? r.reason}`);
    } else if (r.value.length === 0) {
      console.warn(`[scrape] ${state}: returned 0 listings (possible throttle/empty)`);
    } else {
      console.log(`[scrape] ${state}: ${r.value.length} raw listings`);
    }
  });

  // Zone 3 only shows 3, so we don't need to score every in-spend non-water
  // business — cap the candidate pool to keep scoring cheap and fast.
  const SPEND_CANDIDATE_CAP = Number(process.env.BIZBUYSELL_SPEND_CANDIDATES ?? 12);

  const seen = new Set<string>();
  const water: Listing[] = [];
  const spend: Listing[] = [];
  for (const result of perState) {
    if (result.status !== 'fulfilled') continue;
    for (const row of result.value) {
      const listing = normalizeListing(row);
      if (!listing || seen.has(listing.id)) continue;
      // Keep all water/environmental matches (Zones 1 & 2). Separately collect a
      // capped pool of in-spend non-water businesses (Zone 3 candidates).
      if (matchesWaterFilter(listing.title, listing.description)) {
        seen.add(listing.id);
        water.push(listing);
      } else if (inSpendRange(listing.ebitda, listing.cashFlow) && spend.length < SPEND_CANDIDATE_CAP) {
        seen.add(listing.id);
        spend.push(listing);
      }
    }
  }
  return [...water, ...spend];
}
