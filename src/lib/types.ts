// Canonical domain types — both mock data and real scraped data conform to these,
// so the feed/detail UI works identically with either source.

export type Verdict = 'PURSUE' | 'DIG_DEEPER' | 'PASS' | 'EDGE_CASE';
export type PipelineStatus = 'scraped' | 'scored' | 'researched' | 'failed';

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

// A listing as scraped + normalized (before scoring/research)
export type Listing = {
  id: string;
  source: string;
  externalId: string;
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
