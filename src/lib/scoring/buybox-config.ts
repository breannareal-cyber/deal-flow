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
