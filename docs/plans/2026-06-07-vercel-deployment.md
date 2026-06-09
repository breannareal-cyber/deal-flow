# Plan: Deploy DealFlow to Vercel (production)

*Date: 2026-06-07 · Owner: Breanna Real*
*Goal: Get the DealFlow engine live on Vercel — feed reachable at a real URL, pipeline running on a schedule against a real database.*

---

## Decisions (locked 2026-06-07)

| Decision | Choice | Why |
|----------|--------|-----|
| Deploy method | **GitHub → Vercel** | Auto-deploy on every push; the long-term workflow. Repo currently on `main`, **no remote yet**. |
| Database | **Vercel Marketplace Neon** | Auto-injects `DATABASE_URL` into the project; Neon free tier covers this workload; billed/managed through Vercel. |
| Cron strategy | **Consolidate 3 → 1** | Vercel **Hobby caps at 2 crons**; one orchestrator (`runFullPipeline`) stays free. `runFullPipeline()` already exists. |

---

## The Core Problem

This app runs fine on localhost but **cannot run on Vercel as-is.** One hard blocker and several supporting gaps:

1. **🔴 Blocker — storage is local-filesystem-only.** `getStorage()` (`src/lib/storage/index.ts:42`) *always* returns the JSON store, which does `fs.writeFile('.data/listings.json')`. Vercel's serverless FS is **read-only** → every scrape/score/research write throws in prod. The code anticipates Neon (`// TODO: when capabilities.usesDatabase() → return neonStore`) but **the Neon store was never built.**
2. **🟡 No migrations exist.** Schema is fully defined (`src/db/schema.ts`), `drizzle.config.ts` is set, the `neon-http` client is correct (`src/db/client.ts`) — but `drizzle/` (generated SQL) does not exist. Nothing has ever been applied to a database.
3. **🟡 Schema-shape mismatch.** JSON store flattens `score`/`research`/`userAction` onto one object. Postgres schema is **relational** (separate `scores`, `research`, `user_actions` tables joined on `listing_id`). The Neon store must map between these two shapes — this is the real implementation work.
4. **🟡 Cron count exceeds Hobby.** `vercel.json` has 3 crons; Hobby allows 2.
5. **🟢 Untracked code.** Almost the entire app is untracked in git (`src/`, `docs/`, `vercel.json`, etc.). Needs a clean commit before pushing.

---

## Architecture

**⚠️ Plan correction (found during Work, 2026-06-07): the existing schema is broken and must be redesigned.** The relational `src/db/schema.ts` does not match the app's runtime types: (1) `listings.id` is a random UUID but the app uses text IDs `${source}-${externalId}`; (2) `scores` is missing `zone` and `summary` (both core to the feed); (3) `listings` is missing ~10 `Listing` fields. A field-by-field relational mapping would drop data and break ID-based lookups.

**Decision: document-oriented schema.** Each typed object (`Listing`, `Score`, `Research`) is stored as a `jsonb` column. Only fields we query/sort/constrain become real columns: `id` (text PK = app's own ID), `source`/`externalId` (unique), `pipelineStatus`, `scrapedAt` (sort), `duplicateOf`, `retryCount`, `userAction`. Unused `user_actions` and `pipeline_runs` tables are dropped (the `userAction` column replaces the former; the latter is never written). Lossless, mirrors the JSON store's whole-object semantics, no migration needed when types evolve.

- **Database:** Neon Postgres (Marketplace). Tables: `listings`, `scores`, `research`, `user_actions`, `pipeline_runs` (already defined). FKs cascade-delete from `listings`. Unique constraints: `listings(source, external_id)`, `scores(listing_id)`, `research(listing_id, depth)`.
- **Storage layer:** new `src/lib/storage/neon-store.ts` implements the existing `Storage` interface. `getStorage()` returns it when `capabilities.usesDatabase()` is true, else falls back to JSON store (localhost dev keeps working).
- **Pipeline:** unchanged orchestration. One behavioral relaxation noted below (serial-write constraint).
- **Cron:** one new route `src/app/api/cron/pipeline/route.ts` calling `runFullPipeline()`. `vercel.json` → single cron. Old `/api/cron/{scrape,score,research}` routes **kept** (useful for manual staged triggers; just no longer Vercel-scheduled).
- **AI / external:** Anthropic (scoring), Apify (scrape), Tavily (research) unchanged — all gated by `capabilities.*`, degrade gracefully if a key is missing.

### Env vars to set in Vercel (Production)

| Var | Required? | Notes |
|-----|-----------|-------|
| `DATABASE_URL` | ✅ auto | Injected by Neon Marketplace integration — **do not set manually.** |
| `ANTHROPIC_API_KEY` | ✅ | On Vercel there's **no env collision** (the local `DEALFLOW_ANTHROPIC_KEY` workaround is localhost-only). `config.ts` already falls back to `ANTHROPIC_API_KEY`. |
| `APIFY_TOKEN` | ✅ for real scraping | Without it, only Craigslist scrapes. |
| `CRON_SECRET` | ✅ | Vercel Cron auto-sends `Authorization: Bearer <CRON_SECRET>`. **Auth fails CLOSED in prod** — without it, paid scrape/score endpoints are publicly triggerable. |
| `TAVILY_API_KEY` | optional | Without it, research stage is skipped (scoring still works). |
| `ANTHROPIC_MODEL` | optional | Defaults to `claude-sonnet-4-6`. |
| `BIZBUYSELL_STATE_URLS`, `BIZBUYSELL_RESULTS_PER_STATE`, `APIFY_ACTOR_ID` | optional | Sensible defaults in `config.ts`. |

---

## Known Risks / Constraints

- **⏱️ 300s cron timeout.** Consolidating means scrape→score→research run in one function. Apify scrapes can take minutes (see `docs/solutions/2026-06-07-apify-run-reliability.md`); scoring a batch ran ~1:19 (env-and-pipeline doc). Keep `SCORE_BATCH`/`RESEARCH_BATCH` modest so the full chain stays under `maxDuration = 300`. If it times out, fallback is Pro plan + the original 3 staggered crons (routes are kept), or async Apify runs. **Flag, don't over-engineer for v1.**
- **🔁 Serial-write constraint relaxes on Neon.** The pipeline persists scores serially because the JSON store does whole-file read-modify-write (clobber risk). Neon writes are independent rows — the constraint is no longer required, but we **leave the existing serial loop as-is for v1** (correct, just slightly slower). Do not "optimize" it in this deploy.
- **🧊 Next 16 static prerender.** Feed/listing pages read from storage at request time. Confirm they don't get statically prerendered at build (would snapshot an empty DB). Cron/API routes already set `dynamic = 'force-dynamic'`; verify the read pages do too (or use `revalidate`).
- **🙈 `.gitignore` ignores `.env*`** — including `.env.local.example`. Force-add the example so collaborators/future-you have the template; real `.env.local` stays ignored.

---

## Progress (2026-06-07)

**Phase A — COMPLETE ✅** (code is Vercel-ready; lint + typecheck + 23 tests all green)
- ✅ Task 1 — Neon store built (`src/lib/storage/neon-store.ts`), switch flipped, lazy DB client (`src/db/client.ts`), 6 mapper tests.
- ✅ Task 2 — Migration generated: `drizzle/0000_redundant_purifiers.sql` (3 tables, text PK, jsonb, cascade FKs).
- ✅ Task 3 — Consolidated cron `src/app/api/cron/pipeline/route.ts`; `vercel.json` → 1 cron.
- ✅ Task 4 — Read pages confirmed dynamic; clean `next build`; `.env.local.example` force-added.

**Phase B — MOSTLY DONE ✅** (2026-06-07)
- ✅ Task 5 — GitHub: pushed to https://github.com/breannareal-cyber/deal-flow (`main`).
- ✅ Task 6 — Vercel project `deal-flow` linked; Neon Marketplace integration `neon-cerulean-candle` provisioned + connected; `DATABASE_URL` set across Production/Preview/Development.
- ✅ Task 7 — Migration applied to production Neon (`listings`/`scores`/`research` + enums live).
- ✅ `CRON_SECRET` set in Production.
- ✅ First production deploy LIVE: **https://deal-flow-zeta.vercel.app** (read path verified: `/api/listings` → `[]` from Neon, homepage HTTP 200).
- ⚠️ Task 8 — BLOCKED on API keys: `ANTHROPIC_API_KEY`, `APIFY_TOKEN` (required for scrape/score), `TAVILY_API_KEY` (optional). **These were wiped from `.env.local` by the Neon `env pull` and must be re-supplied by Breanna** (values live in provider dashboards).
- ⚠️ GitHub auto-deploy NOT connected — the Vercel GitHub App authorization is a browser step. CLI deploy works in the meantime.

**Phase C — COMPLETE ✅** (2026-06-07)
- ✅ `ANTHROPIC_API_KEY` + `APIFY_TOKEN` set in Vercel production; redeployed.
- ✅ GitHub auto-deploy connected (pushes to `main` now deploy automatically).
- ✅ Write path verified: production pipeline trigger scraped 35 (bizbuysell 18 + craigslist 17), scored 15, all landed in Neon. Feed returns them with correct zones (1 CRITERIA_MATCH, 3 SPEND_OUTSIDE_WATER, 11 EXCLUDE). No DB errors.
- ➡️ 20 listings remain `scraped` (SCORE_BATCH=15/run by design) — they score on the next cron run, or a manual re-trigger.

**DEPLOYMENT COMPLETE.** Live: https://deal-flow-zeta.vercel.app · cron `/api/cron/pipeline` every other day 12:00 UTC.

### 🔐 Follow-up for Breanna
Both `ANTHROPIC_API_KEY` and `APIFY_TOKEN` were pasted into chat → recommend rotating both (generate new, delete old) in the Anthropic Console + Apify dashboard, then update Vercel (`vercel env rm` + `add`) and `.env.local`.

### ⚠️ Incident note
Adding the Neon integration triggered an automatic `vercel env pull` that **overwrote `.env.local`**, wiping local API keys. No backup existed (file was gitignored). Lesson for next time: pull Marketplace env to a throwaway file (`--environment` to a temp path), never let it target `.env.local` when that file holds local-only secrets.

## Tasks (in order)

### Phase A — Make the code Vercel-ready (must precede deploy)

**Task 1 — Build the Neon store**
- Files: `src/lib/storage/neon-store.ts` (new), `src/lib/storage/index.ts` (flip switch), `src/__tests__/neon-store.test.ts` (new)
- Implement every `Storage` method against Drizzle, mapping relational rows → flattened `StoredListing`:
  - `getFeed`/`getById` → join `listings` ⋈ `scores` ⋈ `research` ⋈ latest `user_action`; filter `userAction !== 'pass'` and `duplicateOf IS NULL`; sort by `scrapedAt desc`.
  - `upsertListings` → `onConflictDoNothing`/`DoUpdate` on `(source, external_id)`, preserving existing score/research/action.
  - `saveScore` → upsert into `scores` with `onConflictDoUpdate` on `listing_id` (re-scoring overwrites).
  - `saveResearch` → upsert into `research` on `(listing_id, depth)`.
  - `setAction` → insert `user_actions` row (history) OR upsert; `getFeed` reads the latest.
  - `recordFailure` → increment `retry_count`, set status `failed` at `MAX_RETRIES=3` else `scraped`.
  - `setStatus`, `getByStatus`, `count` → direct.
- In `index.ts`: `return capabilities.usesDatabase() ? neonStore : jsonStore;`
- Tests: unit-test the row→`StoredListing` mapper with fixture rows (no live DB needed); verify `getFeed` filtering/sort logic.
- **Done when:** with `DATABASE_URL` set, the app reads/writes Neon; without it, JSON store still works locally. Mapper tests green.

**Task 2 — Generate + commit Drizzle migrations**
- Files: `drizzle/**` (generated)
- Run `npm run db:generate` → review generated SQL (enums + 5 tables + constraints) → commit.
- **Done when:** `drizzle/` contains the initial migration and it matches `schema.ts`.

**Task 3 — Consolidate crons into one orchestrator**
- Files: `src/app/api/cron/pipeline/route.ts` (new), `vercel.json` (edit)
- New route: auth-guard with `isAuthorized`, `dynamic='force-dynamic'`, `maxDuration=300`, `GET` → `runFullPipeline()` → JSON result.
- `vercel.json`: replace 3 cron entries with one — `{ "path": "/api/cron/pipeline", "schedule": "0 12 */2 * *" }` (every other day, noon UTC). Keep the 3 old route files for manual use.
- **Done when:** `vercel.json` has exactly one cron; new route returns a pipeline summary locally.

**Task 4 — Pre-deploy hygiene**
- Files: `src/app/page.tsx` / `src/app/saved/page.tsx` / `src/app/listings/[id]/page.tsx` (verify dynamic), `.gitignore` (force-add example)
- Confirm read pages are dynamic (no build-time snapshot of empty DB).
- `git add -f .env.local.example`.
- Run `npm run build` locally with `DATABASE_URL` set to a throwaway/empty Neon to confirm it compiles and doesn't prerender data pages.
- **Done when:** clean `next build`; pages render dynamically.

### Phase B — Provision + deploy (mostly Vercel dashboard / CLI; I'll guide, you click)

**Task 5 — GitHub repo + push**
- Create a GitHub repo (private), add as `origin`, commit all untracked app code, push `main`.
- **Done when:** `dealflow` is on GitHub with a clean working tree.

**Task 6 — Vercel project + Neon integration**
- Import the GitHub repo into Vercel (root = `dealflow` if repo root differs).
- Add **Neon** from Vercel Marketplace → connects `DATABASE_URL` automatically to all environments.
- **Done when:** project exists; `DATABASE_URL` present in project env.

**Task 7 — Apply migrations to Neon**
- Pull the prod `DATABASE_URL` (`vercel env pull`) → run `npm run db:migrate` against it (or `drizzle-kit push` for first apply).
- **Done when:** Neon has all 5 tables + enums; `count()` returns 0 cleanly.

**Task 8 — Set remaining env vars + first deploy**
- Add `ANTHROPIC_API_KEY`, `APIFY_TOKEN`, `CRON_SECRET` (and optional `TAVILY_API_KEY`, `ANTHROPIC_MODEL`) in Vercel → Production.
- Trigger deploy (push or redeploy).
- **Done when:** deploy succeeds, app loads at the Vercel URL showing the empty 3-zone feed (empty state, not an error).

### Phase C — Verify end-to-end

**Task 9 — Verify write + read path in prod**
- Manually trigger the pipeline: `curl -H "Authorization: Bearer $CRON_SECRET" https://<app>.vercel.app/api/cron/pipeline` → expect a JSON summary (scraped/scored/researched counts).
- Confirm rows land in Neon (Drizzle Studio or Neon console).
- Reload the feed → listings appear, scored, in the right zones. Test a Save/Pass action → persists across reload.
- Confirm the scheduled cron is registered in Vercel → Settings → Cron Jobs.
- **Done when:** scrape→score→research writes to Neon and the live feed reflects it; user actions persist; cron is scheduled.

---

## Test Strategy

- **Unit:** Neon row→`StoredListing` mapper (Task 1) with fixture rows; `getFeed` filter/sort. Existing tests (`buybox-filter`, `normalize`, `dedup`) must stay green.
- **Integration (manual, prod):** the `/api/cron/pipeline` trigger in Task 9 is the integration test — it exercises every storage method against real Neon.
- **E2E (manual, prod):** load feed → trigger pipeline → reload → Save/Pass → reload. Documented checklist in Task 9.
- *(No automated E2E harness for v1 — single-user app, manual verification is proportionate. Noted as a known gap.)*

---

## Done Criteria (whole plan)

Live Vercel URL serving the 3-zone feed; Neon holds the data; one scheduled cron runs the full pipeline every other day; manual trigger works with `CRON_SECRET`; Save/Pass actions persist. Localhost dev still works unchanged (JSON store fallback).

### Ready for: Work Phase
→ Start at **Task 1 (Neon store)** — it's the critical path and the only substantial code. Tasks 5–9 are provisioning/verification I'll walk you through.
