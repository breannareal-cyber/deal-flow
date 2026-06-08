// Breanna's buy box — the live scoring criteria. Edit here to refine the gates.
// Mirrors eta-book-learnings.md "Breanna's Buy Box" + the 7-gate framework.

export const BUY_BOX = {
  buyer: {
    background:
      'MBA (CU Boulder Leeds), Bio Chem / Pre-Med (Arizona), environmental engineering lab work (CU Boulder). Can improve a water business on BOTH the technical and business axes.',
    capital: '~$150K cash down + SBA 7(a) loan (max $5M, ~10% equity injection) + seller note. Low equity is the tightest constraint.',
  },
  sector: {
    bullseye: ['water quality', 'water testing', 'water treatment', 'well services', 'environmental services'],
    adjacent: ['environmental remediation', 'industrial water treatment', 'stormwater management', 'utility infrastructure', 'HVAC'],
  },
  // Canonical spend range — the single source of truth. config.ts SPEND_MIN/MAX
  // and the scoring prompt both derive from these numbers. Do not redefine elsewhere.
  size: {
    ebitdaFloor: 300_000,
    ebitdaCeiling: 1_500_000,
    note: 'Buy box is $300K–$1.5M EBITDA. Below ~$400K, flag SBA debt-service coverage as a ⚠️ caution (coverage gets tight) — but do NOT exclude; it stays in range.',
  },
  geography: { preferred: ['Colorado', 'Mountain West'], note: 'CO/Mountain West preferred; remote ownership possible.' },
  exit: '5-year hold → sell to PE roll-up or strategic buyer',
};

// The 7 deal-killer gates (hard gates fail → PASS). EBITDA quality, SBA eligibility,
// and working capital were added on ETA-expert review.
export const DEAL_KILLER_GATES = [
  { key: 'affordable', label: 'Affordable on her structure', hard: true },
  { key: 'key_man', label: 'Key-man risk', hard: true },
  { key: 'concentration', label: 'Customer concentration', hard: true },
  { key: 'durability', label: 'Durability (AI/disruption)', hard: true },
  { key: 'ebitda_quality', label: 'EBITDA quality', hard: true },
  { key: 'sba_eligible', label: 'SBA eligibility', hard: true },
  { key: 'working_capital', label: 'Working capital', hard: false },
];

export const BUY_BOX_VERSION = 1;

// HARD EXCLUDE — categories that must NEVER surface anywhere (feed or scorer),
// no matter how the other signals look. Breanna's standing rule. Matched as
// substrings against title + sector + description (case-insensitive).
// NOTE: HVAC is deliberately NOT here — it's an adjacent buy-box sector and can
// legitimately score into "In Spend · Outside Water". HVAC is filtered only out
// of the "Freshly Hauled In" section (see feed-client).
export const PROHIBITED_SECTORS = [
  'gun', 'firearm', 'ammo', 'ammunition', 'shooting range', 'tactical',
  'jewel', 'jewelry', 'jeweler', 'pawn', 'watch repair', 'gold buyer',
  'liquor', 'wine & spirits', 'spirits', 'package store',
  'laundr', 'laundromat', 'dry clean', 'wash & fold',
];

export function isProhibited(...text: (string | null | undefined)[]): boolean {
  const hay = text.filter(Boolean).join(' ').toLowerCase();
  return PROHIBITED_SECTORS.some((t) => hay.includes(t));
}

// Off-market scoring weights — the lever for retuning the thesis as Breanna learns
// the market. Each dimension is scored 0–5 (see scoring/score-offmarket.ts); the
// weighted average is the fit score. Edit these numbers, not the scorer.
//   longevity            — years in operation (retirement-likelihood proxy)
//   cashFlowResilience   — essential/recurring/fragmented (inferred; off-market = coarse)
//   modernizationHeadroom— how much digital/commercial upside is unrealized
//   sectorFit            — bullseye water vs adjacent vs off-thesis
//   keyManRisk           — owner-dependence (LOWER is better; flips in the math)
//   sellerMotivation     — old + stale + single-location tells
export const OFFMARKET_WEIGHTS = {
  longevity: 2,
  cashFlowResilience: 2,
  modernizationHeadroom: 3,
  sectorFit: 3,
  keyManRisk: 2,
  sellerMotivation: 2,
} as const;

export type OffMarketWeights = Record<keyof typeof OFFMARKET_WEIGHTS, number>;
