---
title: "Reserved env var collisions, parallel-call/serial-write, and single-source thresholds"
date: 2026-06-07
tags: [env, nextjs, ai, pipeline, gotcha]
category: gotcha
module: api
symptoms: ["ANTHROPIC_API_KEY not set despite being in .env.local", "feature scattered across files contradicts itself", "JSON store loses writes under concurrency", "listing permanently buried after one error"]
---

# Env collisions + pipeline patterns

## Problem & Solutions (several related gotchas from one build)

### 1. Host-reserved env var silently ignored
`.env.local` had a valid `ANTHROPIC_API_KEY` but the app saw it empty — yet `APIFY_TOKEN` (same file) loaded fine. **Cause:** the host environment (Claude Code's runtime) exports `ANTHROPIC_API_KEY` as empty, and **dotenv won't override an already-set process.env var.**
**Fix:** read from a non-colliding name first: `process.env.DEALFLOW_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY`. Diagnose with a temp debug route returning `keyLen` (never the value).

### 2. Single config defined three incompatible ways
The spend threshold lived as `$400K` (buybox-config), `$250K` (config SPEND_MIN), and `$300K` (LLM prompt). A $350K deal classified inconsistently.
**Fix:** one canonical source (`BUY_BOX.size`), everything else derives:
```ts
export const SPEND_MIN = BUY_BOX.size.ebitdaFloor;
export const SPEND_MAX = BUY_BOX.size.ebitdaCeiling;
```
Lesson: any value that feeds an LLM prompt AND code AND config must have exactly one definition.

### 3. Parallel API calls + whole-file JSON store = lost writes
Parallelizing scoring (5 concurrent Claude calls) was a 3.3× speedup (4:21 → 1:19) — but the JSON store does whole-file read-modify-write, so concurrent writes clobber.
**Fix:** parallelize the slow calls, persist serially:
```ts
const results = await Promise.allSettled(batch.map(scoreListing)); // parallel
for (const r of results) { if (r.status==='fulfilled') await save(...) } // serial writes
```

### 4. Transient error permanently buries a record
`catch → setStatus('failed')` meant one Anthropic 429 / malformed JSON removed a deal forever (the `scraped` query never re-picks `failed`).
**Fix:** `recordFailure()` keeps it `scraped` (retryable) until `retryCount >= MAX_RETRIES`, then `failed`. Wrap every `JSON.parse` of an LLM response in try/catch — treat malformed output as retryable, not fatal.

### 5. LLM-as-filter beats keyword matching for semantic categories
Keyword pre-filters can't tell "water-meter manufacturer" (water-relevant, no water word in title) from "dry cleaner mentions environmental compliance" (not water). Pattern: cheap keyword pre-filter to cut volume → LLM does the real semantic classification. Pre-filter generously, let the model be the judge.

## Related
- [Apify run reliability](2026-06-07-apify-run-reliability.md)
- [Scraping via Apify](2026-06-07-scraping-akamai-apify.md)
