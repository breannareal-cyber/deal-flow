---
title: "Off-market website + blurb enrichment (and the 'zero true leads / same businesses' fix)"
date: 2026-06-14
phase: plan
status: ready-for-work
depends_on:
  - docs/plans/2026-06-07-buybox-off-market-sourcing.md
  - docs/solutions/2026-06-08-government-registry-sourcing.md
---

# Plan: Off-market website + blurb enrichment

## Problem (validated, not assumed)

The off-market feed surfaces ~zero true leads and feels frozen. Two **independent**
causes, confirmed by a live data spike + code read on 2026-06-14:

1. **No discriminating signal (precision).** The CO registry (`4ykn-tg5h`) returns
   only name, city, formation date, registered agent — no website, no description.
   Because off-market listings carry a *synthetic* SOS URL, `enrichOffMarket`'s
   `isProbableWebsite()` short-circuits **all** web probes
   (`src/lib/enrichment/index.ts:26,34`), so `siteLastUpdated`/`domainCreatedAt` are
   always null and `modernizationScore` defaults to a flat 3
   (`src/lib/scoring/score-offmarket.ts:48`). With no signal, the scorer cannot tell
   a real water driller from a foundation driller or a church.

2. **Oldest-first monotony (the "repeat" feel).** Dedup is **correct** — IDs persist
   in Neon and `fetchOffMarketCandidates` skips `existingIds`
   (`colorado-offmarket.ts:132`). The feel of repetition comes from paging
   `entityformdate asc` every run through the same drilling-heavy population, so each
   batch is more low-signal drilling/association names that never clear the bar.

### Spike evidence (5 real entities)
- 5/5 had findable web presence; 4/5 had an official domain; 5/5 blurbs accurate.
- **Elco Drilling** matched on the name token `drilling` but is **foundation**
  drilling, not water — the blurb correctly disqualifies it (precision win).
- **Canfield** real age is 1925, not its 1965 formation date (age correction).
- **Woodland Pump** has no own domain (Facebook + directories only) — the
  "keep, score lower" no-website case is real and must be handled.

## Goal

Add a best-effort enrichment step that resolves each off-market business's website
and a 1–2 sentence "what they do" blurb via AI web search, feed that signal into the
(still deterministic) scorer so genuine leads clear the bar and false positives are
demoted, and reduce oldest-first monotony.

## Non-goals / invariants
- **Scoring stays deterministic and credential-free.** The LLM lives only in
  *enrichment*; `scoreOffMarket` continues to read plain fields with safe defaults.
  Enrichment failure must never fail a run (mirror Wayback/WHOIS degradation).
- No new **required** paid API key. AI web search routes through the AI Gateway with
  a current Claude model. (Grounding stays lightweight: city corroboration +
  confidence, not a paid search provider — revisit only if accuracy regresses.)
- Enrichment is **write-once-then-cached**; bounded retries via existing `retryCount`;
  capped per run. Never re-search an already-enriched listing.

## Architecture decisions
- **One search-capable model call per listing** picks the official site, writes the
  blurb, classifies sector (`water` | `water_adjacent` | `not_water` | `unknown`),
  and returns a confidence. The spike showed the search tool already yields a usable
  synthesized blurb + ranked links, so a separate fetch+summarize round trip is not
  required for v1 (homepage fetch can be a later refinement).
- **Verification gate:** accept a `website` only if the result corroborates name AND
  city/region; otherwise treat as no-website (store `null`, low confidence). Persist
  `website`, `websiteConfidence`, `businessDescription`, `blurbSource` with
  `fieldSources` marked `'enriched'`.
- **Resolved site replaces the SOS URL for probes:** once a real `website` exists,
  run the existing Wayback/WHOIS probes against it so `siteLastUpdated` /
  `domainCreatedAt` finally populate for off-market.
- **Sector fit from the blurb, not just the name.** Extend `sectorFitScore` to honor
  an enrichment-derived classification so `not_water` (e.g. Elco foundation drilling)
  is demoted even though the name contains `drilling`. Name/keyword path remains the
  fallback when enrichment is absent.
- **No-website handling:** keep the lead, mark unenriched, treat absent web presence
  as a *mild* negative on modernization (older/unmodernized), never an exclusion.

## Data model (jsonb — no migration)
Add to `Listing` (`src/lib/types.ts`):
- `website?: string | null`
- `websiteConfidence?: 'high' | 'low' | null`
- `businessDescription?: string | null`  (the blurb; distinct from `description`)
- `enrichmentSector?: 'water' | 'water_adjacent' | 'not_water' | 'unknown' | null`
- `blurbSource?: 'web_search' | 'site' | null`
`fieldSources` gains `'enriched'` as a valid `FieldSource` value.
> Decision: feed `businessDescription` into the existing `description` slot the
> scorer already reads (`score-offmarket.ts:54`) OR widen `sectorFitScore`'s text to
> include `businessDescription` — pick one in Task 4 to avoid double-counting.

---

## Tasks (TDD: RED → GREEN → REFACTOR per task)

### Task 0 — Confirm prod cron is adding rows  *(diagnostic gate, no code)*
Pull Vercel runtime logs for `/api/cron/offmarket` and read the `[co-offmarket]`
per-page output. Confirm whether prod is adding new rows each run or erroring (the
local store is a stale 6-row dev artifact; no `.env.local` to reach prod Neon).
**Gate:** if the cron is erroring/adding nothing, fix that first — it would mask the
enrichment win.

### Task 1 — Website + blurb enrichment module  `src/lib/enrichment/website.ts`
- Pure function `resolveWebsite({ name, city, state }, deps)` → `{ website,
  websiteConfidence, businessDescription, enrichmentSector, blurbSource } | null`.
- `deps.search` injected (AI Gateway web-search call) so tests mock the boundary.
- Verification: require name + city/region corroboration; below threshold → website
  `null`, confidence `'low'`, but still return blurb/sector if confidently about the
  right entity.
- **Tests (RED first):** mock search returning (a) clean official-site hit →
  high-confidence website + water sector; (b) directory-only/no-domain (Woodland) →
  null website, blurb present, kept; (c) wrong-sector hit (Elco) → `not_water`;
  (d) ambiguous/wrong-city → low confidence, website null; (e) search throws →
  returns null, no exception.

### Task 2 — Wire enrichment into `enrichOffMarket`  `src/lib/enrichment/index.ts`
- Call `resolveWebsite` first; if a verified `website` returns, run Wayback/WHOIS
  against it (drop the SOS short-circuit when a real site exists).
- Set `fieldSources` entries to `'enriched'`. Preserve independent degradation.
- **Tests:** enrichment populates website+blurb and then probes the resolved host;
  no-website path still returns the listing unharmed; all-fail path = original listing.

### Task 3 — Idempotency / caching / cost cap  `src/lib/pipeline.ts`
- Skip `resolveWebsite` if the listing is already enriched (`website` set or
  `fieldSources.website === 'enriched'`).
- Bound per-run enrichment count; on search failure increment `retryCount`, retry up
  to `MAX_RETRIES`, then stop.
- **Tests:** second run does not re-search; failures respect retry cap.

### Task 4 — Blurb-aware scoring  `src/lib/scoring/score-offmarket.ts`
- `sectorFitScore` honors `enrichmentSector`: `water` → 5, `water_adjacent` → 3,
  `not_water` → 1 (demote despite name token), `unknown`/absent → existing
  name/keyword path. Resolve the description double-count noted above.
- Keep deterministic; no LLM here. Add `nowYear` injection already present.
- **Tests:** Elco-style (`not_water`) scores below threshold; James-style (`water`
  + old + stale site) clears DIG_DEEPER/PURSUE; absent enrichment = today's behavior
  (regression-proof existing tests).

### Task 5 — Reduce oldest-first monotony  `colorado-offmarket.ts`
- Smallest change that works: page from a **rotating offset/cursor** (persist how
  deep we've scanned) or interleave oldest-first with a most-recent slice, so a run
  isn't always the same antique drilling cohort. Keep dedup + per-sector diversity.
- **Tests:** consecutive runs draw from different offset windows; dedup + sector cap
  still hold; no entity surfaces twice.

### Task 6 — Surface the new fields in the UI (feed card)
- Show `website` (link), `businessDescription` (blurb), and an "unenriched / no site
  found" badge. Confidence-low website visibly flagged.
- **Verify the full loop:** cron/enrich → stored → feed card renders blurb + link;
  empty/loading/no-website states visible. (Frontend completion gate.)

---

## Test strategy
- Unit: `resolveWebsite` with mocked search (5 spike-derived fixtures above);
  `scoreOffMarket` blurb cases; offset-rotation in the scraper.
- Integration: `offmarket-cron` extended — enrich populates website/blurb, scorer
  consumes it, no-website lead still stored. Mock search + fetch; never hit network.
- Regression: existing deterministic-scoring and dedup tests must stay green.

## Risks / mitigations
- **Wrong-company blurb** → verification gate + `websiteConfidence`; low-confidence
  never attaches a website.
- **LLM creeping into scoring** → hard separation; scorer reads fields only.
- **Cost/latency** → cache + per-run cap + small N (batch size).
- **Surfacing fix masking a dead cron** → Task 0 gate runs first.

## Ready for: Work Phase
Vertical slices, enrichment first (Tasks 1→2→3→4), then surfacing (5), then UI (6).
