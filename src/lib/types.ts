// Canonical domain types — both mock data and real scraped data conform to these,
// so the feed/detail UI works identically with either source.

export type Verdict = 'PURSUE' | 'DIG_DEEPER' | 'PASS' | 'EDGE_CASE';
export type PipelineStatus = 'scraped' | 'scored' | 'researched' | 'failed';

// User disposition of a candidate through the pipeline (one canonical field).
export type Stage = 'new' | 'researching' | 'contacted' | 'passed' | 'dead';
// Stages hidden from the active feed.
export const HIDDEN_STAGES: Stage[] = ['passed', 'dead'];

// Three feed zones the scorer classifies into:
//  CRITERIA_MATCH      → water sector + within spend + financeable (the bullseye)
//  WATER_OUTSIDE_SPEND → genuine water business, but EBITDA outside the size range
//  SPEND_OUTSIDE_WATER → in spend range, NOT water, but an enduring durable business
//  EXCLUDE             → junk / wrong-sector-and-not-enduring / asset-only (hidden)
export type Zone = 'CRITERIA_MATCH' | 'WATER_OUTSIDE_SPEND' | 'SPEND_OUTSIDE_WATER' | 'EXCLUDE';

export type DealKiller = {
  label: string;
  status: '✅' | '⚠️' | '❌' | '?';
  note: string;
};

export type FitFactor = { label: string; value: string };

export type WebFinding = { title: string; url: string; snippet: string };

// Where a candidate sits in the market lifecycle:
//  'listed'     → actively for sale (BizBuySell/Craigslist) — has disclosed financials
//  'off_market' → not for sale; sourced from registries (CO Business Entities) — no financials
export type ListingType = 'listed' | 'off_market';

// Per-field provenance, so the UI/scorer never confuses an inferred value with a
// confirmed one. 'source' = straight from a registry/listing; 'estimated' = derived
// or weak proxy (e.g. formation date as age); 'confirmed' = verified in diligence.
export type FieldSource = 'source' | 'estimated' | 'confirmed';

// A listing as scraped + normalized (before scoring/research)
export type Listing = {
  id: string;
  source: string;
  externalId: string;
  listingType: ListingType;
  title: string;
  location: string | null;
  state: string | null;
  sector: string | null;
  askingPrice: number | null;
  revenue: number | null;
  ebitda: number | null;
  cashFlow: number | null;
  yearEstablished: number | null;
  description: string | null;
  reasonForSelling: string | null;
  realEstate: string | null;
  financing: string | null;
  employees: number | null;
  brokerName: string | null;
  brokerFirm: string | null;
  status: string | null; // Active / Sale Pending / Sold
  listingUrl: string;
  scrapedAt: string;
  pipelineStatus: PipelineStatus;
  duplicateOf: string | null;

  // --- Off-market fields (null for 'listed' listings) ---
  registeredAgent?: string | null; // CO Business Entities agent — NOT the owner
  ownerFirstLicenseDate?: string | null; // reserved for a future DORA/DWR overlay
  domainCreatedAt?: string | null; // WHOIS/RDAP — business-age signal
  siteLastUpdated?: string | null; // Wayback last meaningful snapshot — staleness signal
  // Per-field provenance (e.g. { yearEstablished: 'estimated', registeredAgent: 'source' }).
  fieldSources?: Partial<Record<keyof Listing, FieldSource>> | null;
};

// Deterministic off-market sub-scores (0–5) + the derived ideal-target flag.
// Weights live in scoring/buybox-config.ts so the thesis can be retuned in code.
export type OffMarketScore = {
  dimensions: Record<string, number>; // e.g. { longevity: 4, modernizationHeadroom: 5, sectorFit: 4 }
  weightedTotal: number;
  upsideWithoutOwner: boolean; // modernizationHeadroom high AND key-man risk low
};

// Scoring output
export type Score = {
  verdict: Verdict;
  zone: Zone;
  dealKillers: DealKiller[];
  fitFactors: FitFactor[];
  topQuestions: string[];
  scoreReasoning: string;
  missedDimension?: string; // EDGE_CASE only
  summary: string; // 1-2 line card summary
  offMarket?: OffMarketScore; // present only for off_market candidates
};

// Research output
export type Research = {
  depth: 'medium' | 'deep';
  summary: string;
  webFindings: WebFinding[];
  ownerInfo: string;
  keyRisks: string[];
};

// The fully-assembled record the UI consumes
export type ScoredListing = Listing & {
  score: Score | null;
  research: Research | null;
};

export function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return 'N/A';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function listingAge(yearEstablished: number | null): string {
  if (!yearEstablished) return 'N/A';
  const age = 2026 - yearEstablished;
  return age > 0 ? `${age} yrs` : 'New';
}
