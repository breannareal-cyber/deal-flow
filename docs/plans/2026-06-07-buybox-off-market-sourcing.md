# Implementation Plan — Buybox: Off-Market Acquisition Sourcing

**Date:** 2026-06-07
**Branch:** `feature/buybox-sourcing`
**Status:** Plan complete → ready for Work phase

---

## TL;DR — this is an extension, not a new app

The DealFlow app already implements the full pipeline this feature needs:

| Capability needed | Already exists? | Where |
|---|---|---|
| Source registry (pluggable) | ✅ | `src/lib/scrapers/sources/{types,index}.ts` |
| Pipeline: scrape→score→research | ✅ | `src/lib/pipeline.ts` |
| Buybox scoring (water thesis, 7 gates, zones) | ✅ | `src/lib/scoring/{buybox-config,score-listing}.ts` |
| Storage + dedup (json + Neon) | ✅ | `src/lib/storage/*`, `src/db/schema.ts` |
| Cron endpoints | ✅ | `src/app/api/cron/{scrape,score,research,pipeline}` |
| Feed + detail UI | ✅ | `src/components/feed/*`, `src/app/{page,listings/[id]}` |
| Manual full-pipeline trigger | ✅ | `src/app/api/scrape/manual/route.ts` |

**Because everything conforms to the `Listing` type, a new off-market source flows through scoring, storage, dedup, and the feed for free.** The delta is: (1) a Colorado Socrata source that joins two APIs, (2) off-market-aware fields + scoring (no financials pre-contact), (3) Wayback/WHOIS enrichment, (4) a "3 new per run" capped dedup, (5) pipeline-stage tracking + add-by-URL + filters in the UI.

**Out of scope for v1 (later phase):** Mountain West states (UT/WY/ID/MT/NM), DWR PDF parsing, Google Places/NGWA enrichment, outreach features.

---

## Key architectural decisions

### D1 — Extend `Listing`, don't fork it
Off-market businesses have no asking price / EBITDA / broker. Add optional fields to `Listing` (all nullable, default-safe so existing listed flow is untouched):
- `listingType: 'listed' | 'off_market'` (default `'listed'`)
- `registeredAgent: string | null` — from Business Entities
- `ownerFirstLicenseDate: string | null` — from DORA (`licensefirstissuedate`)
- `domainCreatedAt: string | null` — WHOIS/RDAP
- `siteLastUpdated: string | null` — Wayback last meaningful snapshot
- `fieldSources: Record<string, 'source' | 'estimated' | 'confirmed'> | null` — per-field provenance (the "confidence/source" requirement)

For off-market records: `listingUrl` = company website (or SOS entity URL fallback), `yearEstablished` derives from `entityformdate`, financial fields stay `null`. **Document-oriented schema means no migration** — these live inside the `data` jsonb. Only add a promoted column if we need to *filter/sort* on it (we will for `stage` — see D5).

### D2 — New source: `coloradoOffMarket` (Business Entities spine — FINALIZED by Task 0)
**Task 0 verdict (see `docs/spikes/2026-06-07-colorado-data.md`):** the Entities↔DORA join is **dead** (Entities has only `agentfirstname/lastname` — registered agent, no owner; DORA is keyed on the licensee person — no shared key). DORA is ~95% healthcare; water-relevant codes are plumbing-only (adjacent), and well drillers/treatment operators aren't in DORA at all. **So: Business Entities (`4ykn-tg5h`) is the v1 spine, alone. DORA join dropped. DWR well-driller PDF = documented fast-follow.**

Source build:
1. **Query Business Entities** with the canonical filter (lives in `config.ts`):
   - **Positive:** water keywords, **word-boundary matched** (so `PUMP` ≠ "PUMPkin Ranch") — reuse the `WATER_WORDS`/`WATER_PHRASES` pattern already there.
   - **Negative (mandatory):** exclude `IRRIGATION, DITCH, CANAL, RESERVOIR, DISTRICT, MUTUAL, ASSOCIATION` (+ `CONCRETE`) — without this, oldest-first surfaces 1880s mutual ditch/irrigation co-ops and water districts, which are not acquirable.
   - **Scope:** `entitystatus like '%Good%'`, prefer domestic entity types (`DPC`/`DLLC`) over foreign (`FPC`/`FLLC`), `principalstate = CO`.
2. Normalize to off-market `Listing`s. Stable id = `co-sos-${entityid}` (durable → re-runs never mint a new id → upsert-by-id prevents re-adding). `yearEstablished` ← `entityformdate` (corroborating signal, not trusted alone).
3. `enabled()` = always (free, no auth). Socrata supports `$where`/`$limit`/`$offset`/`$order` (SoQL) — page through it.

Apply the **compounded reliability gotchas**: sequential paged calls with per-unit logging, bounded retry, tight timeout (never let `Promise.allSettled` swallow a dropped page silently).

**Fast-follow (post-v1):** DWR Board of Examiners well-driller/pump-installer PDF as a higher-precision overlay for the well/pump bullseye (the authoritative business roster DORA lacks).

### D3 — "3 new per run" capped dedup
The source must return *exactly 3 not-previously-surfaced* candidates and not waste enrichment/scoring on ones we'll discard. Add `getExistingIds(prefix?: string): Promise<Set<string>>` to the `Storage` interface — **nearly free** (both stores already compute existing ids; `neon-store.upsertListings` builds `existingIds` today). 

**Cost/latency ordering (do not enrich everything):** cheap registry filter → skip ids already in the set → **deterministic pre-score from free registry fields** (license age, formation date, location) → enrich only the **top ~5** with Wayback/WHOIS (network calls) → score → take the best 3. Pre-scoring before enrichment keeps the run inside the 300s Vercel function budget even when the filter yields many weak candidates. Because dismissed/passed candidates are *stored* (never deleted), they're in the existing-id set → **never re-surfaced**. Cap is config-driven: `OFFMARKET_BATCH` (default 3).

### D4 — Reuse scoring; add an off-market path
Keep the existing zone/verdict/dealKillers model (it's tuned and the UI renders it). For `listingType === 'off_market'`, branch the scoring:
- Financial gates (`affordable`, `ebitda_quality`, `concentration`, `working_capital`) are **unknowable pre-contact → `?`** and become diligence questions (the scorer already handles `?` gracefully).
- **Deterministic sub-scores from enrichment data** (configurable weights in `buybox-config.ts`), 0–5 each:
  - *Longevity / seller-motivation* ← `entityformdate`, `ownerFirstLicenseDate`, `siteLastUpdated`, `domainCreatedAt`, single-location, individual-agent
  - *Modernization headroom* ← Wayback staleness, no-https, dated footer
  - *Sector fit* ← keyword/taxonomy match (LLM refines edge cases)
- **LLM call** (small) only for the fuzzy dimensions: sector-fit nuance, improvability fit, key-man read from site text if a URL exists.
- **Derived flag in code:** `upsideWithoutOwner = modernizationHeadroom ≥ 4 && keyManRisk ≤ 2`. Rank flagged candidates to the top within their zone.
- Extend `Score` with optional `offMarket?: { dimensions: Record<string, number>; weightedTotal: number; upsideWithoutOwner: boolean }`.

This satisfies "weights configurable in code" better than a pure-LLM approach and cuts cost/variance. Hard *financial* gates remain in the model as diligence flags, honest about being un-evaluable until diligence.

**The scorer must honor `fieldSources` confidence.** `entityformdate` is a weak age proxy on its own — LLCs re-register/convert entity type, so a 1974 business can show a 2012 formation date. Treat it as low-confidence unless corroborated by WHOIS domain age or "since 19XX" site copy; the longevity sub-score should weight corroborated signals higher than a lone formation date.

### D5 — Pipeline stages REPLACE `userAction` (one canonical disposition field)
Spec wants `new / researching / contacted / passed / dead`. Current `userAction` is `pass | save | pursue`. **Do not keep both** — two overlapping status concepts will drift and contradict, exactly the "single config defined three incompatible ways" gotcha in `docs/solutions/2026-06-07-env-and-pipeline-patterns.md`. **Replace `userAction` with `stage`** (promoted enum column, default `new`):
- Migrate existing rows: `pass → passed`, `save → researching`, `pursue → contacted`; everything else → `new`.
- Update `getFeed()` in **both** stores to hide `stage IN ('passed','dead')` (today it filters `userAction = 'pass'`).
- Update the action route to set `stage`; retire `userAction` from schema + `StoredListing` + `rowToStoredListing`.
- `pipelineStatus` (`scraped/scored/researched/failed`) is **machine processing state** and stays — it's orthogonal to human disposition, no conflict.

This is the one real schema change (rename/replace column + enum + a single backfill UPDATE — fine on neon-http, which can't do multi-statement transactions).

### D6 — Manual add-by-URL
New `POST /api/candidates/add` `{ url }` → **normalize the URL first** (lowercase host, strip protocol/`www.`/trailing slash) so the same site can't be added twice → enrich (Wayback + WHOIS + best-effort site read) → off-market `Listing` (id `manual-${stableHash(normalizedUrl)}`) → score → store → return scored candidate. A URL-only candidate has *less* structured data than the scrape (no formation/license/financials), so the off-market scorer must **degrade gracefully to site-read + enrichment only**. Distinct from the existing full-pipeline manual route (which scrapes all sources).

### D7 — Same feed, type filter
Off-market candidates flow into the existing feed (type-driven UI). Add filters: sector tag, pipeline stage, and listed-vs-off-market. Add the "upside-without-the-owner" badge + per-field confidence indicators on the detail view. No separate app.

---

## Architecture

- **Database (Neon/Drizzle):** one change — **replace** `userAction` with a `stage` enum column on `listings` (default `new`); single backfill UPDATE. Everything else rides in `data` jsonb (no migration).
- **API routes:**
  - `GET /api/cron/offmarket` — capped off-market scrape (auth via `isAuthorized`)
  - `POST /api/candidates/add` — add-by-URL (auth)
  - `POST /api/listings/[id]/action` — **existing route, keep POST convention** (not PATCH); change payload from `{action}` to `{stage}`
  - `GET /api/listings` — extend with `?stage=&sector=&type=` filters
- **Lib:**
  - `src/lib/scrapers/sources/colorado-offmarket.ts` (new source — DWR/DORA spine, Entities enrichment)
  - `src/lib/enrichment/{wayback,whois}.ts` (new)
  - `src/lib/scoring/score-offmarket.ts` (new) + weights in `buybox-config.ts`
  - `src/lib/pipeline.ts` — add `runOffMarketScrape()`; reuse `runScore`/`runResearch`
  - `src/lib/types.ts` — extend `Listing` + `Score`
  - `src/lib/storage/*` — add `getExistingIds`, `setStage` (replacing `setAction`); map `stage` column
- **AI:** existing Anthropic scorer, extended for off-market (small structured call). Model per `config.anthropic`.
- **No new external paid deps for v1** (Socrata, Wayback, RDAP are free).

---

## UI/UX Delivery Plan

**User journey:** Breanna opens the app every couple of days → sees ≤3 fresh off-market candidates at the top of the feed, each with a fit score, sector tag, age/seller-motivation signals, and (when present) the "upside-without-the-owner" badge → she filters by sector/stage, reads a candidate's gates + diligence questions + confidence-tagged fields → moves it through stages (new→researching→contacted→passed/dead) or pastes a URL to add one manually.

**UI-to-backend wiring matrix:**

| User action | Backend | Success UI | Failure UI |
|---|---|---|---|
| Open feed | `GET /api/listings?type=&stage=&sector=` | Ranked cards, off-market badge, flag badge | Empty state ("no candidates yet — run a scan") / error toast |
| Filter by sector/stage/type | client filter + querystring | List re-renders, count updates | "no matches" empty state |
| Move stage | `POST /api/listings/[id]/action {stage}` | Card moves/badge updates optimistically | Revert + error toast |
| Add by URL | `POST /api/candidates/add {url}` | New scored card appears, "added" toast | Inline form error (bad URL / fetch failed) |
| Trigger scan (manual) | `GET /api/cron/offmarket` (or button) | "+N new" toast, feed refresh | Error toast with reason |

**State matrix (feed + detail + add-form):** loading (skeleton — `feed-skeleton.tsx` exists), empty (first-run / filtered-to-zero), error (source/scoring failure surfaced, not swallowed), success. Add-by-URL: idle / submitting / success / validation-error.

**UX constraints:** mobile-first cards (existing), keyboard-accessible stage controls + filter chips, confidence/source shown as a subtle tag per inferred field (not a wall of badges), respects the existing visual system. Off-market cards must visually read as "not yet for sale" (distinct from listed deals).

---

## Tasks (vertical slices, in order)

> AGENTS.md mandate: **before writing code, read the relevant guide in `node_modules/next/dist/docs/`** (Next 16.2.7 — route handlers, server/client components). Heed deprecation notices.

**Task 0 — Data spike (DECISION GATE, no production code)** ⚠️ *do this first*
Files: `docs/spikes/2026-06-07-colorado-data.md` (findings only — throwaway curl/jq, not shipped code)
Validate the central assumptions before architecting the source:
- Hit Business Entities (`4ykn-tg5h`), DORA (`7s5z-vewr`), and pull the DWR PDF. Inspect real field shapes.
- Does name-filtering Business Entities surface real water operators? Measure rough recall/precision on a sample.
- Pin the **DORA license code → water-sector map** (which codes actually mean water/pump work).
- Test the **DWR↔DORA↔Entities name match** — how many operators join cleanly (DBA vs legal name, punctuation, Inc/LLC)?
- Confirm the durable id key per registry (license no / entity id).
Outcome: a short findings doc that confirms or revises **D2's spine** (DWR/DORA-primary vs Entities-primary) before Task 5. *If the join is as weak as suspected, the source ships license-roster-first with Entities as best-effort enrichment.*

**Task 1 — Off-market domain model + provenance**
Files: `src/lib/types.ts`, `src/__tests__/types-offmarket.test.ts`, `src/lib/scrapers/normalize.ts` (add `normalizeOffMarket`)
Tests (unit): off-market `Listing` builds with nulls for financials; `fieldSources` provenance set; `yearEstablished` derives from `entityformdate`.
Outcome: a typed off-market candidate object exists and is distinguishable from listed.

**Task 2 — Add-by-URL slice (end-to-end, no external source yet)**
Files: `src/app/api/candidates/add/route.ts`, `src/components/feed/add-candidate.tsx`, wire into `src/app/page.tsx`, `src/__tests__/integration/candidates-add.test.ts`
Tests (integration): POST a URL → off-market listing stored + scored; bad URL → 400; duplicate URL → no second record. (E2E) paste URL in UI → card appears.
Outcome: user can manually add a candidate and see it scored in the feed. *(Proves the off-market path end-to-end before automation.)*

**Task 3 — Off-market scoring + configurable weights + derived flag**
Files: `src/lib/scoring/score-offmarket.ts`, `src/lib/scoring/buybox-config.ts` (add `OFFMARKET_WEIGHTS`), `src/lib/pipeline.ts` (route off-market to off-market scorer), `src/__tests__/score-offmarket.test.ts`
Tests (unit): deterministic dimensions from fixture enrichment data; financial gates → `?`; `upsideWithoutOwner` true only when modernization≥4 & keyman≤2; weight changes change the total.
Outcome: off-market candidates get a fit score + flag without inventing financials.

**Task 4 — Enrichment: Wayback + WHOIS**
Files: `src/lib/enrichment/wayback.ts`, `src/lib/enrichment/whois.ts`, `src/lib/enrichment/index.ts`, `src/__tests__/enrichment.test.ts`
Tests (unit, mocked fetch): Wayback parses last-snapshot date / handles no-snapshots; WHOIS/RDAP extracts creation date / handles redaction; both set `fieldSources`.
Outcome: candidates carry site-staleness + domain-age signals feeding Task 3 scores.

**Task 5 — Colorado off-market source (license/DWR spine) + capped dedup**
Files: `src/lib/scrapers/sources/colorado-offmarket.ts`, `src/lib/scrapers/sources/index.ts` (register), `src/lib/storage/{index,json-store,neon-store}.ts` (add `getExistingIds`), `src/lib/config.ts` (`OFFMARKET_BATCH`, source cfg), `src/__tests__/colorado-offmarket.test.ts`
Built on **Task 0's verdict** (likely DORA/DWR roster as spine, Entities as best-effort enrichment join).
Tests (unit, mocked fetch): water-license-code filter applied; Entities enrichment attaches formation date when name matches and degrades to `null`+low-confidence when it doesn't; **filter→pre-score→enrich top-5→take 3** ordering; stops at 3 *new* (already-stored ids skipped); per-unit logging on empty/error (no silent drop).
Outcome: source returns exactly 3 fresh CO candidates, never a repeat, without enriching the whole page.

**Task 6 — Scheduled off-market run + cron**
Files: `src/lib/pipeline.ts` (`runOffMarketScrape`), `src/app/api/cron/offmarket/route.ts`, `vercel.json`/`vercel.ts` cron (`every other day`), `src/__tests__/integration/offmarket-cron.test.ts`
Tests (integration): cron scrapes ≤3 → scores → stores; auth required; second run returns different candidates.
Outcome: every other day, 3 new scored candidates appear automatically.

**Task 7 — Replace `userAction` with `stage`, add filters in the feed**
Files: `src/db/schema.ts` (replace `userAction` enum with `stage` enum column + migration + backfill UPDATE), `src/lib/storage/{index,json-store,neon-store}.ts` (`setStage` replaces `setAction`; update `getFeed` filter + `rowToStoredListing`), `src/app/api/listings/route.ts` (`?stage=&sector=&type=`), `src/app/api/listings/[id]/action/route.ts` (POST `{stage}`), `src/components/feed/{feed-client,listing-card}.tsx` (stage control, flag badge, confidence tags, filters), `src/__tests__/integration/stages.test.ts`, `e2e/stages.spec.ts`
Tests (integration): backfill maps old actions (pass→passed etc.); stage transitions persist; `getFeed` hides passed/dead; filters work. (E2E) move a candidate new→contacted, filter to it.
Outcome: one canonical disposition field; user reviews, filters, and advances candidates; off-market badge + flag + confidence visible.

---

## Test Strategy

- **Unit:** off-market normalization & provenance (T1), off-market scoring math + weights + derived flag + confidence-weighting (T3), enrichment parsers with mocked fetch incl. redaction/no-snapshot edges (T4), source filter+enrich+pre-score+cap+dedup with mocked fetch (T5). Mirror existing `src/__tests__` patterns (`dedup.test.ts`, `buybox-filter.test.ts`).
- **Integration:** add-by-URL route (T2), off-market cron run (T6), stage backfill + transitions + filters (T7) — mock only the external boundary (Socrata/DWR/Wayback/WHOIS/Anthropic), exercise the real route + storage (json-store in tests).
- **E2E:** paste-URL → card appears (T2); move candidate across stages + filter (T7).
- **Acceptance checks tied to user-visible behavior:** "≤3 new per run," "never re-surfaced," "upside-without-the-owner badge shows on the right candidates," "off-market card reads as not-for-sale."

---

## Risks & gotchas (from `docs/solutions/`)
- **Never let `Promise.allSettled` swallow a unit** — per-unit log on Socrata pages (apify-run-reliability.md). Sequential + bounded retry.
- **One canonical threshold** — off-market weights/gates derive from `buybox-config.ts` only (env-and-pipeline-patterns.md #2).
- **Parallel calls + serial writes** for any batched enrichment/scoring (json store clobbers under concurrent writes) (#3).
- **Transient error = retryable, not buried** — reuse `recordFailure` (#4).
- **Env collisions** — reuse `DEALFLOW_ANTHROPIC_KEY` fallback; Socrata needs no key, so off-market scrape works even with zero credentials except scoring.

---

### Ready for: Work Phase
Start at **Task 0 (data spike — decision gate)**, then proceed Task 1 → 7. Each build task is a vertical slice with its own tests (RED → GREEN → REFACTOR).
