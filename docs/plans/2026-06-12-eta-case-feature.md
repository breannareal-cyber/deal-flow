# ETA Daily Case Feature

**Date:** 2026-06-12  
**Status:** Ready for Work

---

## What We're Building

A "Study" button in the app header that opens a right-side drawer displaying the current ETA acquisition case — read the case, click "Reveal Answer" to see the expert analysis, advance manually when ready. Every 10th case is auto-generated from a real listing in the pipeline DB.

---

## Architecture

### Database

Two new tables added to `src/db/schema.ts`:

**`eta_cases`** — pre-built curriculum cases
```
id             serial PK
case_number    integer UNIQUE NOT NULL
title          text NOT NULL
industry       text NOT NULL
difficulty     integer NOT NULL  (1–5)
source         text NOT NULL DEFAULT 'curriculum'  ('curriculum' | 'pipeline')
listing_id     text → listings.id ON DELETE SET NULL (nullable, pipeline cases only)
data           jsonb  (ETACaseData)
created_at     timestamp
```

**`eta_progress`** — single-row progress tracker
```
id             integer PK DEFAULT 1  (always 1 — single user)
current_case   integer NOT NULL DEFAULT 1
updated_at     timestamp
```

**ETACaseData shape (jsonb):**
```typescript
type ETACaseData = {
  company: string;          // case presentation, plain text, \n\n = paragraph break
  expertAnswer: string;     // full expert analysis, same format
  teachingConcepts: string[];
  keyRedFlags: string[];
  keyGreenFlags: string[];
}
```

### API Routes

**`GET /api/eta/case`**
- Upsert `eta_progress` row (id=1, default current_case=1) if not exists
- If `current_case % 10 === 0`: generate pipeline case from a random high-scored listing via Claude → return
- Otherwise: fetch from `eta_cases` where `case_number = current_case`
- If no case found (past end of seeded content): loop back, return case 1
- Response: `{ case: { caseNumber, title, industry, difficulty, source, data }, current: number, total: number }`

**`POST /api/eta/advance`**
- Increment `current_case` in `eta_progress` (upsert)
- Response: `{ newCase: number }`

No auth required — single-user UI action (not a cron endpoint).

### UI Components

**`src/components/eta/eta-case-button.tsx`** (client component)
- Renders the "Study" button + full drawer
- Internal state: `open`, `revealed`, `loading`, `case`
- Fetches `/api/eta/case` on first open (not on mount — lazy)
- Passes `onAdvance` to drawer which calls `/api/eta/advance` then re-fetches

**Drawer layout:**
- Right-side slide-in panel, full height, max-w-2xl
- Fixed overlay (same pattern as ZoneModal — backdrop-blur, escape-key close)
- Sticky header: case number + title + close button
- Scrollable body: company presentation
- Sticky footer: "Reveal Answer" button (toggles) + "Next Case →" button

**`src/app/page.tsx`** — wire in button
- Pass `right={<NavRight />}` to SiteNav
- `NavRight` = flex row containing `<ETACaseButton />` + "The Hold" link

### Aesthetic (matching existing app)
- Background: `#0e1011` (ink), `#15181b` (card surface)
- Text: `#ece7dd` (primary), `#b6bcc2` (secondary), `#8b949b` (muted)
- Accent: `#df7d62` (coral) for the reveal button
- Border: `#2a2e34`
- Button style: matches existing eyebrow pill — `text-[11px]` tracking, `px-5 py-2.5`
- "Study" button: ink background, cream text (matches "The Hold")
- "Reveal Answer": coral background once clicked, switches label to "Hide Answer"

---

## UI/UX Wiring Matrix

| User action | API call | UI result |
|---|---|---|
| Click "Study" button | `GET /api/eta/case` (lazy, first open only) | Drawer slides in, case loads |
| Click "Reveal Answer" | none | `revealed` state toggles, expert answer fades in below |
| Click "Next Case →" | `POST /api/eta/advance` then `GET /api/eta/case` | Case refreshes, `revealed` resets to false |
| Click overlay or ✕ | none | Drawer closes, state preserved (re-open shows same case) |
| Press Escape | none | Drawer closes |

## State Matrix

| State | What user sees |
|---|---|
| `loading=true` | Skeleton pulse in drawer body |
| `loading=false, case=null` | "No cases loaded yet — pipeline hasn't run." |
| `revealed=false` | Case presentation only, coral "Reveal Answer" button |
| `revealed=true` | Case + expert answer, button label → "Hide Answer" |

---

## Tasks (in order)

### Task 1 — DB schema + migration
**Files:** `src/db/schema.ts`, `drizzle/0003_eta_cases.sql` (generated)  
**Work:** Add `etaCases` and `etaProgress` tables to schema. Run `npx drizzle-kit generate` to produce migration. Run `npx drizzle-kit migrate` to apply.  
**Done when:** `db.select().from(etaCases)` works without error.

### Task 2 — Seed 15 curriculum cases
**Files:** `src/lib/eta/seed-cases.ts`, `scripts/seed-eta.ts`  
**Work:** Write 15 well-crafted ETA cases (pest control, HVAC, plumbing, commercial cleaning, B2B services, waste services, landscaping, niche manufacturing — mix of difficulties 1–3 for the first 15). Each case has full company presentation + expert answer + teaching concepts.  
**Done when:** Running `npx tsx scripts/seed-eta.ts` populates `eta_cases` with 15 rows.

### Task 3 — API routes
**Files:** `src/app/api/eta/case/route.ts`, `src/app/api/eta/advance/route.ts`  
**Work:** GET returns current case (with upsert of progress row). POST increments. Pipeline case generation (every 10th) is a stub for now returning a placeholder.  
**Done when:** `curl /api/eta/case` returns a case JSON. `curl -X POST /api/eta/advance` increments and returns `{ newCase: 2 }`.

### Task 4 — ETACaseButton + Drawer component
**Files:** `src/components/eta/eta-case-button.tsx`  
**Work:** Client component. Drawer slides in from right. Two-state body (case / revealed). Sticky header + footer. Matches app dark theme exactly. Escape key + overlay click closes.  
**Done when:** Button renders in isolation, drawer opens/closes, reveal toggle works, Next Case calls advance + refetches.

### Task 5 — Wire into header
**Files:** `src/app/page.tsx`  
**Work:** Add `ETACaseButton` to SiteNav's `right` slot alongside "The Hold" link. Check saved/page.tsx and listings/[id]/page.tsx — add there too if appropriate.  
**Done when:** "Study" button appears in top-right of header on all pages. Full flow works end-to-end.

### Task 6 — Pipeline case generation (every 10th)
**Files:** `src/app/api/eta/case/route.ts`, `src/lib/eta/generate-pipeline-case.ts`  
**Work:** When `current_case % 10 === 0`, fetch a random `PURSUE` or `DIG_DEEPER` verdict listing from DB, pass to Claude with a prompt that formats it as an ETA case, return the generated case (not saved to DB — ephemeral).  
**Done when:** Advancing to case 10 returns a real listing formatted as a case study.

---

## Test Strategy

- **Unit:** `src/lib/eta/seed-cases.ts` — verify all 15 cases have required fields, non-empty company/expertAnswer strings
- **Integration:** GET `/api/eta/case` returns 200 + correct shape. POST `/api/eta/advance` increments. Second GET returns case 2.
- **Manual:** Full drawer flow in browser — open, reveal, advance, close, re-open (same case).

---

## Notes / Gotchas from Solutions Docs

- `docs/solutions/2026-06-07-env-and-pipeline-patterns.md` — Neon client is lazy-initialized; DB calls in API routes are fine, but never call at module level.
- `docs/solutions/2026-06-08-vercel-hobby-private-repo-deploy-block.md` — No impact here.
- `docs/solutions/2026-06-08-scroll-reveal-blanks-above-the-fold.md` — Reveal animation note: use opacity transition, not display toggle, to avoid layout flash.

---

## Ready for: Work Phase

To resume: `read docs/plans/2026-06-12-eta-case-feature.md and continue from Task N`
