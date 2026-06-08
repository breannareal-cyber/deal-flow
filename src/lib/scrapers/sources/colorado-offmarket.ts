// Colorado off-market source — the v1 discovery spine (Task 0 verdict).
// Queries the CO Business Entities Socrata dataset (4ykn-tg5h) for water-sector
// businesses, EXCLUDING the mutual-irrigation/ditch/district co-ops that pollute a
// naive name filter. No DORA join (no shared key — see docs/spikes/). Free, no auth.

import type { Listing } from '@/lib/types';
import { normalizeOffMarket } from '@/lib/scrapers/normalize';

const ENTITIES_URL = 'https://data.colorado.gov/resource/4ykn-tg5h.json';
const PAGE_SIZE = 50;
const MAX_PAGES = 12; // bound the run; ~600 rows scanned max
// Formation-date floor. Pre-1950 water-named entities are 1880s–1920s mutual
// water/ditch companies (shareholder water-rights co-ops), NOT acquirable
// businesses. The real targets are 1950s–2000s service companies. Applied at the
// SQL layer (efficiency) and re-checked in code (defense-in-depth, testable).
const MIN_FOUNDED_YEAR = 1950;

// Positive signals, split by match strategy:
//  - PREFIX_STEMS: token must START WITH the stem (pump→pump/pumps/pumping; drill→drilling)
//  - EXACT_WORDS:  token must EQUAL the word — so "well" matches "WELL SERVICE" but NOT
//    "WELLSHIRE" / "WELLINGTON" / a church. Bare "water" is deliberately EXCLUDED here:
//    it's the term that drags in every water *utility/co-op* ("X WATER COMPANY",
//    "WATER USERS", "DOMESTIC WATER") — none of which are acquirable service businesses.
//  - WATER_PHRASES: multi-word terms specific enough to be safe substrings; these are
//    how genuine treatment/systems businesses surface without the bare "water" net.
const PREFIX_STEMS = ['pump', 'drill'];
const EXACT_WORDS = ['well', 'wells', 'septic', 'sewer', 'wastewater'];
const WATER_PHRASES = [
  'water treatment', 'water system', 'water well', 'well drilling', 'well service',
  'water filtration', 'water softening', 'water conditioning', 'water purification',
  'ground water', 'pump service',
  // Water quality / testing / environmental — the bullseye sector, previously absent.
  'water quality', 'water testing', 'water analysis', 'water lab', 'water monitoring',
  'environmental service', 'environmental testing', 'water resource', 'water works',
  // Utility-side water service (private operators; co-ops still blocked by NEGATIVE).
  'water utility', 'utility service',
];
// Negative terms: co-ops, government, and false-positive substrings. Belt-and-suspenders
// alongside the phrase strategy above.
const NEGATIVE = ['irrigation', 'ditch', 'canal', 'reservoir', 'district', 'mutual', 'association', 'concrete', 'pumpkin', 'church', 'water users', 'water company'];

// SQL-escape a term for a SoQL string literal.
function lit(s: string): string {
  return s.replace(/'/g, "''");
}

// The $where clause: good standing AND (any positive LIKE) AND (no negative LIKE).
export function buildEntitiesQuery(): string {
  const positives = [
    ...PREFIX_STEMS.map((w) => `upper(entityname) like '%${lit(w.toUpperCase())}%'`),
    ...EXACT_WORDS.map((w) => `upper(entityname) like '%${lit(w.toUpperCase())}%'`),
    ...WATER_PHRASES.map((p) => `upper(entityname) like '%${lit(p.toUpperCase())}%'`),
  ].join(' OR ');
  const negatives = NEGATIVE.map((n) => `upper(entityname) not like '%${lit(n.toUpperCase())}%'`).join(' AND ');
  return (
    `entitystatus like '%Good%' AND (${positives}) AND ${negatives} ` +
    `AND upper(principalstate) = 'CO' AND entityformdate >= '${MIN_FOUNDED_YEAR}-01-01T00:00:00'`
  );
}

// Token-prefix water match + negative guard (the precise filter the SQL LIKE can't
// do). NEGATIVE is checked first so "pumpkin"/"irrigation" are rejected even though
// a token starts with a water stem.
function isWaterBusiness(name: string): boolean {
  const hay = name.toLowerCase();
  if (NEGATIVE.some((n) => hay.includes(n))) return false;
  if (WATER_PHRASES.some((p) => hay.includes(p))) return true;
  const tokens = hay.split(/[^a-z]+/).filter(Boolean);
  return tokens.some(
    (t) => EXACT_WORDS.includes(t) || PREFIX_STEMS.some((stem) => t.startsWith(stem))
  );
}

// Coarse sector bucket from the entity name — used only to keep a single batch from
// being monopolized by one sub-sector. Drilling outfits are the oldest water
// businesses in CO, so a pure oldest-first batch is otherwise all drilling.
export function offMarketSector(name: string): string {
  const u = name.toUpperCase();
  if (/\bDRILL/.test(u)) return 'drilling';
  if (/QUALITY|TESTING|ANALYSIS|MONITOR|ENVIRONMENT|\bLAB\b/.test(u)) return 'quality-env';
  if (/UTILITY|WATER SYSTEM|WATER WORKS|RESOURCE|TREATMENT|FILTRATION|CONDITION|SOFTEN|PURIF/.test(u)) return 'treatment-utility';
  if (/SEPTIC|SEWER|WASTEWATER|SANITARY/.test(u)) return 'septic-sewer';
  if (/\bPUMP/.test(u)) return 'pump';
  if (/\bWELLS?\b/.test(u)) return 'well';
  return 'other';
}

export type FetchOpts = {
  limit: number;
  existingIds: Set<string>;
  fetchFn?: typeof fetch;
};

// Page the dataset (oldest first), filter to genuine water businesses, skip ids
// already surfaced, and return up to `limit` brand-new off-market listings. Per-page
// logging so a dropped/empty page is never silent (compounded gotcha).
export async function fetchOffMarketCandidates(opts: FetchOpts): Promise<Listing[]> {
  const fetchFn = opts.fetchFn ?? fetch;
  const where = buildEntitiesQuery();
  // Gather an eligible pool (oldest-first) across pages, then diversify by sub-sector
  // before truncating to the batch limit — so one sector can't monopolize a run.
  const pool: Listing[] = [];

  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      `${ENTITIES_URL}?$where=${encodeURIComponent(where)}` +
      `&$order=entityformdate%20asc&$limit=${PAGE_SIZE}&$offset=${page * PAGE_SIZE}`;

    let rows: Record<string, unknown>[] = [];
    try {
      const res = await fetchFn(url);
      if (!res.ok) {
        console.warn(`[co-offmarket] page ${page}: HTTP ${res.status}`);
        break;
      }
      rows = (await res.json()) as Record<string, unknown>[];
    } catch (e) {
      console.warn(`[co-offmarket] page ${page}: ${(e as Error).message}`);
      break;
    }

    if (rows.length === 0) {
      console.log(`[co-offmarket] page ${page}: 0 rows — end of results`);
      break;
    }

    let kept = 0;
    for (const row of rows) {
      const name = String(row.entityname ?? '');
      if (!isWaterBusiness(name)) continue;
      const listing = normalizeOffMarket(row);
      if (!listing || opts.existingIds.has(listing.id)) continue;
      // Defense-in-depth: skip pre-floor entities even if the SQL filter is bypassed.
      if (listing.yearEstablished !== null && listing.yearEstablished < MIN_FOUNDED_YEAR) continue;
      pool.push(listing);
      kept++;
    }
    console.log(`[co-offmarket] page ${page}: ${rows.length} rows, ${kept} new water businesses pooled (pool ${pool.length})`);
    // Page until the pool is deep enough to diversify a full batch from.
    if (pool.length >= opts.limit * 6) break;
  }

  // Diversity pass: cap any one sub-sector so drilling can't fill the batch.
  const perSectorCap = Math.max(1, Math.ceil(opts.limit / 4));
  const counts: Record<string, number> = {};
  const out: Listing[] = [];
  for (const listing of pool) {
    if (out.length >= opts.limit) break;
    const sector = offMarketSector(listing.title);
    if ((counts[sector] ?? 0) >= perSectorCap) continue;
    counts[sector] = (counts[sector] ?? 0) + 1;
    out.push(listing);
  }
  // Backfill (rare): if diversity left the batch short, top up oldest-first.
  if (out.length < opts.limit) {
    for (const listing of pool) {
      if (out.length >= opts.limit) break;
      if (!out.includes(listing)) out.push(listing);
    }
  }
  console.log(`[co-offmarket] selected ${out.length}/${opts.limit} across sectors ${JSON.stringify(counts)}`);
  return out;
}
