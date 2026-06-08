# Buybox — Data Sources

Verified sources for sourcing off-market water-sector acquisition targets
(well drilling, water testing & treatment, pumps, septic/wastewater,
environmental services, irrigation) in Colorado / Mountain West.

Researched & live-tested 2026-06-07.

## v1 — Colorado (free, structured, no auth)

### Colorado Business Entities — Socrata API
- Dataset: `4ykn-tg5h`
- Endpoint: https://data.colorado.gov/resource/4ykn-tg5h.json
- Free, no auth. ~3M+ records. SoQL filtering (`$where`, `$select`, `$limit`).
- **Core company universe.**
- Key fields: `entityname`, `principaladdress1/city/state/zipcode`,
  `entitystatus` ("Good Standing"), `entitytype`, registered-agent
  name/address, **`entityformdate`** (business-age / owner-tenure signal).
- Tested filters (good standing): `%WELL DRILLING%` -> 7; `%SEPTIC%` -> 151.
  Broaden: PUMP, WATER, IRRIGATION, DRILLING, ENVIRONMENTAL + county/zip.

### Colorado DORA Professional & Occupational Licenses — Socrata API
- Dataset: `7s5z-vewr`
- Endpoint: https://data.colorado.gov/resource/7s5z-vewr.json
- Free, no auth, refreshed nightly.
- Key fields: `firstname`, `lastname`, `city`, `mailzipcode`, `licensetype`,
  `licensenumber`, **`licensefirstissuedate`** (top seller-motivation signal),
  `licenselastreneweddate`, `licenseexpirationdate`, `licensestatusdescription`.
- License types are ABBREVIATION CODES, not words. Search by code:
  `MP` (Master Plumber, ~9,285 records), `JP` (Journeyman),
  `MPWP`/`JPWP` (work permits), `RP` (Residential Plumber).
  `like '%PLUMB%'` returns empty — don't text-match.
- Does NOT cover well drillers (those are DWR — see below).

### THE JOIN IS THE PRODUCT
Business Entities = the company. DORA = the person + license date.
Join on owner/name to produce a real candidate. Neither table alone suffices.

### Colorado DWR Board of Examiners — well-driller / pump-installer list
- https://dwr.colorado.gov/services/well-construction-inspection
- Authoritative driller/pump-installer roster that DORA lacks.
- Distributed as PDF (`contractors-by-city.pdf`), updated quarterly. Parse & merge.

### (Heavier, optional) Colorado CDSS / HydroBase Well Permits
- https://dwr.state.co.us/Tools/WellPermits — links wells to the contractor who
  drilled them + permit dates = per-contractor job-volume signal.
- Bulk/GIS export only (no clean REST API). Larger lift; defer.

## Enrichment (free, per candidate)
- **Wayback Machine API** (web.archive.org) — site staleness / dated footers ->
  coasting-toward-retirement signal.
- **WHOIS / RDAP** — domain creation date -> business-age signal
  (registrant data largely redacted post-GDPR, but creation date is reliable).
- **NGWA WellOwner.org** (https://wellowner.org/find-a-contractor/colorado/) &
  **NGWA Buyers Guide** (https://buyersguide.ngwa.org/) — water-specific
  company/contact/geo, scrapable, members only (partial).
- **Google Places API** — Essentials tier ~$5/1K (with $200/mo credit + free
  caps). Best geo/coverage; no owner/age data. Enrichment, not a registry.

## Later phase — Mountain West expansion
No other state has an open-data portal this clean. Each runs a separate
well-driller registry (mostly PDF / search form, per-state scraping required):
Utah DWR · Wyoming State Engineer's Office · Idaho IDWR ·
Montana DNRC Board of Water Well Contractors · New Mexico OSE.
v1 is Colorado-only — do not promise Mountain-West-wide coverage day one.

## Skip
- **Yelp Fusion** — no free tier; only returns businesses with Yelp content
  (rural water/septic operators have none). Coverage gap.
- **Manta / YellowPages / BBB** — no usable API; thin/stale; scraping only.
- **SAM.gov** — federal-contractor population only; small water cos. aren't there.
- **D&B** — paid, redundant given free CO data.
- **Grata / Inven / Cyndx** — PE-scale off-market platforms, mid-five-figure/yr
  contracts. Free CO APIs replicate ~80% for this geography. Only if expanding
  beyond Mountain West.

## Data-handling note
Colorado APIs return real business owners' names/addresses — public B2B registry
data, not customer PII. Keep usage scoped to legitimate B2B contact; mind
CAN-SPAM / state rules as outreach features are added.
