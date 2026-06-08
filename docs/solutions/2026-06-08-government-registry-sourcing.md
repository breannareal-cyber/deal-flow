---
title: "Sourcing businesses from government registries: name-only filters surface co-ops/utilities/churches, not acquirable companies"
date: 2026-06-08
tags: [sourcing, data-quality, scraping, off-market]
category: gotcha
module: scrapers
symptoms: ["oldest-first results are all 1880s mutual ditch/irrigation companies", "WELLSHIRE PRESBYTERIAN CHURCH matched a water filter", "DOMESTIC WATER COMPANY / WATER USERS pollute results", "ROCKY MOUNTAIN PUMPKIN RANCH matched 'pump'", "the planned cross-dataset join returns no matches"]
---

# Sourcing off-market businesses from government registries

## Problem
Building the Buybox off-market source on the Colorado Business Entities Socrata API
(`4ykn-tg5h`) to find acquirable water-sector businesses. Three things that looked
fine in the plan were wrong against real data — and none were catchable by unit tests
(they only appear when you query the live dataset).

## Solution / Findings

### 1. Validate cross-dataset joins with a data spike BEFORE architecting
The plan's centerpiece was joining Business Entities → DORA licenses to attach an
owner + license date. **The join is impossible:** Business Entities exposes only the
*registered agent* (`agentfirstname/lastname`), DORA is keyed on the *licensee person* —
no shared key. DORA is also ~95% healthcare; the only water-relevant codes are
plumbing (`MP`/`JP`), and well drillers/treatment operators aren't in DORA at all.
A 2-hour `curl | jq` spike killed a multi-day build of the wrong architecture.
**Lesson:** before building on a join/filter assumption, hit the real endpoint and
measure. Spikes belong in the plan as a decision gate, not after code.

### 2. Oldest-first + name filter surfaces co-ops, not companies
Ordering water-named entities by `entityformdate asc` returned 1880s–1920s **mutual
irrigation / ditch / canal companies** and **water districts** — shareholder
water-rights co-ops, not sellable businesses. Fixes, in order of leverage:
- **Formation-date floor** (`entityformdate >= 1950`): the single highest-leverage
  filter — nothing acquirable as an independent business was formed in 1891.
- **Negative-term filter**: exclude `irrigation, ditch, canal, reservoir, district,
  mutual, association, water users, water company, church, concrete`.

### 3. Bare keywords over-match; use stems + phrases + word-boundaries
- `'water'` as a bare term drags in every water **utility/co-op** ("X WATER COMPANY",
  "WATER USERS", "DOMESTIC WATER"). Drop it; rely on **water phrases**
  ("water treatment", "water testing", "ground water") instead.
- `'well'` as a substring/prefix matched **"WELLSHIRE PRESBYTERIAN CHURCH"** and
  "WELLINGTON". Match it as an **exact token** (`token === 'well'`), not a prefix.
- `'pump'` must catch pump/pumps/pumping (prefix) but NOT "PUMPKIN" — use a prefix
  stem **plus** a negative list (`pumpkin`) checked first.

Net matcher shape: `NEGATIVE` (substring, checked first) → `WATER_PHRASES` (substring)
→ tokens matched against `EXACT_WORDS` (===) or `PREFIX_STEMS` (startsWith). SQL
`LIKE` is only a coarse pre-filter; the precise filter runs in code (testable).

### 4. Oldest-first monopolizes one sub-sector — diversify the batch
The oldest water businesses in CO are almost all **well-drilling** outfits, so a pure
oldest-first batch was 100% drilling. Pool ~6× the batch size, then cap each
sub-sector (`ceil(limit/4)`) before truncating, with an oldest-first backfill if
diversity leaves the batch short.

## Why It Works
Government entity registries index *legal entities* by name, with no
industry/description field and no owner. So a name filter is simultaneously
low-recall (a real driller named "Johnson & Sons" is invisible) and low-precision
(co-ops, utilities, churches, pumpkin patches match). The durable signals available
are formation date and name tokens — so the precision strategy is layered negative
filters + date floor + token-class matching, validated against live data, not a join.

## Related
- `docs/spikes/2026-06-07-colorado-data.md` — the Task 0 spike findings
- `docs/data-sources.md` — endpoints + which sources to skip
- `2026-06-07-env-and-pipeline-patterns.md` — one-canonical-config (the filter lists
  live once in the source; the prohibited list once in `buybox-config`)
