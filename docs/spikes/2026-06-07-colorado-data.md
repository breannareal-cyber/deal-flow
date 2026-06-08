# Task 0 Spike — Colorado off-market data (DECISION GATE)

**Date:** 2026-06-07 · live curl against the real Socrata endpoints. Throwaway validation, no shipped code.

## Question
Does the planned discovery approach hold? Specifically: (a) is the Business Entities↔DORA join viable, (b) what's the right discovery spine, (c) can we surface real acquirable water businesses?

## Findings

### 1. The Entities↔DORA join is DEAD — drop it from v1
- **Business Entities (`4ykn-tg5h`)** exposes only `agentfirstname/agentlastname` (registered agent) — **no owner field**. Real fields: `entityname, entityid, entitytype, entitystatus, entityformdate, principalcity/state/zip/address1, agent*, jurisdictonofformation`.
- **DORA (`7s5z-vewr`)** is keyed on the **licensee person** (`firstname/lastname/city/licensetype/licensefirstissuedate/...`).
- **No shared key.** Registered agent ≠ owner ≠ licensee. The join the original plan centered on cannot be made reliably. Confirmed dead.

### 2. DORA is mostly healthcare; water relevance is thin
- Top license types: RN (236k), NA (194k), cosmetology, engineers, etc. **Water-relevant = plumbing only:** `MP` Master Plumber (9,286; 4,918 active), `JP` Journeyman (11,801).
- **Well drillers, pump installers, water-treatment operators are NOT in DORA** — they're DWR (well/pump) and CDPHE (treatment operators).
- `licensefirstissuedate` floors at 1970 (registry digitization) — weak age signal, and it's a *person* list with no business mapping.
- **Verdict:** DORA adds little for v1. Plumbing is adjacent, not bullseye, and unjoinable to businesses. Defer.

### 3. Business Entities name-filter IS a viable v1 spine — with mandatory negative-filtering
- Naive "oldest water-named entity in good standing" is **polluted**: ordering by `entityformdate asc` surfaces 1880s **mutual irrigation / ditch / canal companies** — farmer-owned water-rights co-ops, water districts, HOAs. Not acquirable businesses.
- **Negative-filter fixes it.** Excluding `IRRIGATION, DITCH, CANAL, RESERVOIR, DISTRICT, MUTUAL, ASSOCIATION` (+ `CONCRETE`) on a water-keyword query yields clean, real targets:
  - WOODLAND PUMP AND SUPPLY (1965), TRUE PUMP & EQUIPMENT (1972), ARVADA PUMP (1972), B AND J PUMP AND WELL SERVICE (1983), CULLUM PUMPING SERVICE (1988), LIVING WATER PUMP SERVICE (1989), PYRAMID WATER SYSTEMS (1990), GROUND WATER SYSTEMS LLC (1993).
- Remaining noise + fixes:
  - "ROCKY MOUNTAIN PUMPKIN RANCH" → `PUMP` matched `PUMPKIN`. **Use word-boundary matching** (mirror `WATER_WORDS` `\bword\b` approach already in `config.ts`).
  - "SULZER PUMPS (US) INC." (Houston) → out-of-state/too-big. **Prefer domestic entity types** (`DPC`/`DLLC`) over foreign (`FPC`/`FLLC`); confirm `principalstate = CO`.

### 4. `entityformdate` quality
- Real, populated, and old where expected (1965, 1972...). Usable as a **corroborating** age signal. Still down-weight alone (LLC re-registration), but coverage is good — better than feared.

## Decision (revises plan D2)
- **Spine = Business Entities**, water keyword filter (word-boundary) + **negative-filter** (co-op/govt/irrigation) + domestic-entity-type + `principalstate = CO` + good standing.
- **Drop the DORA join** from v1.
- **Enrichment = Wayback + WHOIS** (unchanged), feeding age/modernization signals. `entityformdate` corroborates.
- **DWR well-driller PDF = fast-follow precision overlay** for the well/pump bullseye (authoritative business roster DORA lacks). Not a v1 blocker since Entities already surfaces well/pump cos by name.
- Stable id = `co-sos-${entityid}`.

## Impact on tasks
- **Task 5** simplifies: one source (Entities), no join logic. Filter quality (positive + negative keyword sets) becomes the core — put it in `config.ts` as canonical, word-boundary matched.
- DORA/DWR move to a documented fast-follow.
