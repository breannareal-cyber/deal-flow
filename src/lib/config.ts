// Central config + capability detection. Everything degrades gracefully:
// missing keys disable a stage rather than crash the pipeline.

import { BUY_BOX } from './scoring/buybox-config';

export const config = {
  apify: {
    token: process.env.APIFY_TOKEN ?? '',
    // shahidirfan — beats Akamai, 45 rich fields incl. ebitda/cash_flow/broker/real-estate.
    actorId: process.env.APIFY_ACTOR_ID ?? 'XynfRyQZTeRhNeYrF',
  },
  anthropic: {
    // DEALFLOW_ANTHROPIC_KEY first: avoids the reserved/empty ANTHROPIC_API_KEY
    // that some host environments export (which dotenv won't override). Falls back
    // to ANTHROPIC_API_KEY for production (Vercel), where there's no collision.
    apiKey: process.env.DEALFLOW_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY || '',
    model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
  },
  tavily: {
    apiKey: process.env.TAVILY_API_KEY ?? '',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  cronSecret: process.env.CRON_SECRET ?? '',
  // BizBuySell: keyword search is broken in the actor, but STATE filtering works.
  // So we scrape state category pages (CO + Mountain West) and filter to water/
  // environmental in-code via the keyword pre-filter below. Claude then does the
  // real semantic classification (catches e.g. a water-meter manufacturer whose
  // title has no water keyword).
  bizbuysell: {
    // Colorado (bullseye) + Wyoming. Two states keeps each run fast and cheap.
    stateUrls: (process.env.BIZBUYSELL_STATE_URLS ??
      [
        'https://www.bizbuysell.com/colorado-businesses-for-sale/',
        'https://www.bizbuysell.com/wyoming-businesses-for-sale/',
      ].join(','))
      .split(',').map((u) => u.trim()).filter(Boolean),
    resultsPerState: Number(process.env.BIZBUYSELL_RESULTS_PER_STATE ?? 60),
  },
};

// Water/environmental pre-filter. Two tiers:
//  - WORDS: high-precision single terms, matched on word boundaries (\bword\b) so
//    "well" does NOT match "well-established" — only standalone water terms.
//  - PHRASES: multi-word terms safe as plain substrings (already specific).
// Cuts hundreds of state listings to water-relevant candidates; Claude refines.
const WATER_WORDS = [
  'water', 'wastewater', 'septic', 'sewer', 'sewage', 'stormwater',
  'environmental', 'remediation', 'irrigation', 'backflow', 'potable',
  'groundwater', 'aquifer', 'hydrology', 'hydrogeology', 'plumbing',
  'desalination', 'effluent', 'wells',
];
const WATER_PHRASES = [
  'well drilling', 'water well', 'well pump', 'well & pump', 'well and pump',
  'well service', 'well water', 'drilling company', 'water treatment',
  'water purification', 'water filtration', 'water softener', 'reverse osmosis',
  'water meter', 'water metering', 'utility metering', 'water trucking',
  'water hauling', 'water delivery', 'water store', 'water bottling',
  'drinking water', 'pump station', 'lift station', 'storm water',
  'waste water', 'water systems', 'water utility',
];

export const WATER_KEYWORDS = [...WATER_WORDS, ...WATER_PHRASES];

export function matchesWaterFilter(title: string, description: string | null): boolean {
  const hay = `${title} ${description ?? ''}`.toLowerCase();
  if (WATER_PHRASES.some((p) => hay.includes(p))) return true;
  return WATER_WORDS.some((w) => new RegExp(`\\b${w}\\b`).test(hay));
}

// Spend range — derived from the canonical buy box (buybox-config.ts) so there is
// exactly ONE definition. Used to keep non-water businesses as Zone 3 candidates
// (in-spend). Checks EBITDA or cash flow (SDE); a listing only qualifies if it
// discloses a number in range.
export const SPEND_MIN = BUY_BOX.size.ebitdaFloor;   // $300K
export const SPEND_MAX = BUY_BOX.size.ebitdaCeiling; // $1.5M

export function inSpendRange(ebitda: number | null, cashFlow: number | null): boolean {
  const n = ebitda ?? cashFlow;
  return n !== null && n >= SPEND_MIN && n <= SPEND_MAX;
}

export const capabilities = {
  canScrape: () => !!config.apify.token,
  canScore: () => !!config.anthropic.apiKey,
  canResearch: () => !!config.tavily.apiKey,
  usesDatabase: () => !!config.database.url,
};
