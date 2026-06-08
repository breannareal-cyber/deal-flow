---
title: "Apify run-sync is flaky — sequential + retry-per-unit, never silent Promise.allSettled"
date: 2026-06-07
tags: [scraping, apify, reliability, concurrency]
category: gotcha
module: scrapers
symptoms: ["a whole state silently missing from results", "0 listings with no error", "Apify 400 run-failed", "595 ECONNRESET", "Promise.allSettled hides the failure"]
---

# Apify run-sync reliability

## Problem
A whole state (Wyoming, and the one in-criteria deal it contained) silently vanished from scrape runs. Two compounding causes:
1. **Concurrent `run-sync-get-dataset-items` calls return empty non-deterministically.** Firing 2–6 state scrapes at once → some come back `[]`.
2. **Individual runs are transiently flaky** even sequentially — residential-proxy `595 ECONNRESET` / `run-failed` 400s.

`Promise.allSettled` made it invisible: an empty return is "fulfilled," and even a rejection is swallowed silently. Result: non-deterministic coverage, no log line, a real deal just gone.

## Solution
1. **Run units sequentially** (`BIZBUYSELL_CONCURRENCY=1`) — removes the concurrency-induced empties. Two states fit the time budget easily.
2. **Retry per unit**, distinguishing failure modes:
   - thrown error → transient → retry up to `maxAttempts` (default 2)
   - empty result → could be genuinely empty → retry ONCE, then accept `[]`
3. **Log every unit's outcome** so a silent drop can never recur:
   ```ts
   perState.forEach((r, i) => {
     if (r.status === 'rejected') console.warn(`[scrape] ${state}: FAILED — ${r.reason?.message}`);
     else if (r.value.length === 0) console.warn(`[scrape] ${state}: returned 0 (possible throttle)`);
     else console.log(`[scrape] ${state}: ${r.value.length} raw listings`);
   });
   ```
4. **Tighten the sync `timeout`** (180s, not 280) so a timeout is unambiguous — otherwise a slow success can return empty, trigger a retry, and double-bill the same run.

## Why It Works
The actor is reliable *per successful run* but flaky per *attempt*. Sequential + bounded retry converts "one bad attempt drops a state" into "retry until a good attempt." Per-unit logging turns silent failures into visible ones — the cardinal rule when `allSettled` is involved.

## Related
- [Scraping via Apify](2026-06-07-scraping-akamai-apify.md)
- General lesson: **never let `Promise.allSettled` swallow a unit of work silently** — always log per-unit success/empty/failure.
