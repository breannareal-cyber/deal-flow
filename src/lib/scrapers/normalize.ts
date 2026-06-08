// Normalizes BizBuySell's raw fields (varies slightly by actor) into our Listing type.
// Handles the documented 33-field schema; defends against missing/renamed fields.

import type { Listing } from '@/lib/types';
import { hostFromUrl } from '@/lib/enrichment';

// Parse "$1,400,000" / "$500K" / "1.2M" / "Not Disclosed" → number | null
export function parseMoney(raw: unknown): number | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  if (!s || /not disclosed|n\/?a|undisclosed/i.test(s)) return null;
  const cleaned = s.replace(/[$,\s]/g, '');
  const m = cleaned.match(/^([\d.]+)([KkMm])?/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (isNaN(n)) return null;
  if (m[2]?.toLowerCase() === 'k') n *= 1_000;
  if (m[2]?.toLowerCase() === 'm') n *= 1_000_000;
  return Math.round(n);
}

function parseYear(raw: unknown): number | null {
  if (!raw) return null;
  const n = parseInt(String(raw).replace(/\D/g, ''), 10);
  return n >= 1800 && n <= 2100 ? n : null;
}

function parseInt0(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = parseInt(String(raw).replace(/\D/g, ''), 10);
  return isNaN(n) ? null : n;
}

function str(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim();
  return s && !/^n\/?a$/i.test(s) ? s : null;
}

// Pull a value by trying several possible key names (actors vary)
function pick(row: Record<string, unknown>, ...keys: string[]): unknown {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
  }
  return undefined;
}

// Derive a stable external ID from the listing URL (BizBuySell URLs end in /<id>/)
function externalIdFromUrl(url: string): string {
  const m = url.match(/\/(\d+)\/?(?:\?|$)/);
  return m ? m[1] : url;
}

export function normalizeListing(row: Record<string, unknown>, source = 'bizbuysell'): Listing | null {
  const url = str(pick(row, 'LINK TO DEAL', 'url', 'link', 'listingUrl', 'detailUrl'));
  const title = str(pick(row, 'TITLE', 'title', 'name'));
  if (!url || !title) return null; // can't use a listing without a URL + title

  const externalId = externalIdFromUrl(url);

  // real estate: shahidirfan gives a boolean (real_estate_included_in_asking_price);
  // acquisition-automation gives a string ("Owned | $X"). Handle both.
  const reBool = pick(row, 'real_estate_included_in_asking_price');
  const realEstate =
    str(pick(row, 'REAL ESTATE', 'realEstate')) ??
    (reBool === true ? 'Included in asking price' : reBool === false ? 'Not included' : null);

  return {
    id: `${source}-${externalId}`,
    source,
    externalId,
    listingType: 'listed',
    title,
    location: str(pick(row, 'LOCATION', 'location', 'city')),
    state: str(pick(row, 'STATE', 'state', 'state_code')),
    sector: str(pick(row, 'FINAL_CATEGORY', 'CATEGORY', 'category', 'industry', 'sector', 'listing_category')),
    askingPrice: parseMoney(pick(row, 'PRICE', 'price', 'askingPrice')),
    revenue: parseMoney(pick(row, 'REVENUE', 'revenue', 'grossRevenue', 'gross_revenue')),
    ebitda: parseMoney(pick(row, 'EBITDA', 'ebitda')),
    cashFlow: parseMoney(pick(row, 'CASH FLOW', 'cashFlow', 'sde', 'cash_flow')),
    yearEstablished: parseYear(pick(row, 'YEAR ESTABLISHED', 'yearEstablished', 'established', 'year_established')),
    description: str(pick(row, 'INDUSTRY DETAILS', 'description', 'businessDescription', 'details', 'summary')),
    reasonForSelling: str(pick(row, 'REASON FOR SELLING', 'reasonForSelling', 'reason_for_selling')),
    realEstate,
    financing: str(pick(row, 'FINANCING', 'financing')),
    employees: parseInt0(pick(row, 'NUMBER OF EMPLOYEES', 'employees', 'numberOfEmployees', 'employees_full_time')),
    brokerName: str(pick(row, 'INTERMEDIARY NAME', 'brokerName', 'agentName', 'contactName', 'broker_name')),
    brokerFirm: str(pick(row, 'INTERMEDIARY FIRM', 'brokerFirm', 'firm')),
    status: str(pick(row, 'STATUS', 'status')) ?? 'Active',
    listingUrl: url,
    scrapedAt: new Date().toISOString(),
    pipelineStatus: 'scraped',
    duplicateOf: null,
  };
}

// --- Off-market normalization (CO Business Entities, dataset 4ykn-tg5h) ---

// Year out of an ISO-ish registry date ("1972-03-31T00:00:00.000" → 1972).
function yearFromDate(raw: unknown): number | null {
  if (!raw) return null;
  const m = String(raw).match(/^(\d{4})/);
  if (!m) return null;
  const y = parseInt(m[1], 10);
  return y >= 1800 && y <= 2100 ? y : null;
}

const OFF_MARKET_SOURCE = 'co-sos';

// Build an off-market Listing from just a website URL (manual add-by-URL). The
// registrable host is the stable key, so the same site can't be added twice
// (www/protocol/path are normalized away). Returns null for an unusable URL.
export function normalizeOffMarketUrl(rawUrl: string): Listing | null {
  const host = hostFromUrl(rawUrl);
  // Require a plausible domain: at least one dot, no spaces, a TLD-ish tail.
  if (!host || /\s/.test(host) || !/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null;

  return {
    id: `manual-${host}`,
    source: 'manual',
    externalId: host,
    listingType: 'off_market',
    title: host,
    location: null,
    state: null,
    sector: null,
    askingPrice: null,
    revenue: null,
    ebitda: null,
    cashFlow: null,
    yearEstablished: null,
    description: null,
    reasonForSelling: null,
    realEstate: null,
    financing: null,
    employees: null,
    brokerName: null,
    brokerFirm: null,
    status: null,
    listingUrl: `https://${host}`,
    scrapedAt: new Date().toISOString(),
    pipelineStatus: 'scraped',
    duplicateOf: null,
    registeredAgent: null,
    ownerFirstLicenseDate: null,
    domainCreatedAt: null,
    siteLastUpdated: null,
    fieldSources: { title: 'estimated', listingUrl: 'source' },
  };
}

// Normalize a Colorado Business Entities row into an off-market Listing. Off-market
// candidates have NO disclosed financials — those gates become diligence questions.
// `entityformdate` is recorded as a weak ('estimated') age proxy, not a confirmed
// founding year (LLCs re-register), to be corroborated later by WHOIS/site copy.
export function normalizeOffMarket(row: Record<string, unknown>): Listing | null {
  const entityId = str(pick(row, 'entityid'));
  const name = str(pick(row, 'entityname'));
  if (!entityId || !name) return null; // unusable without a stable id + name

  const city = str(pick(row, 'principalcity'));
  const state = str(pick(row, 'principalstate'));
  const location = [city, state].filter(Boolean).join(', ') || null;
  const yearEstablished = yearFromDate(pick(row, 'entityformdate'));

  const agentFirst = str(pick(row, 'agentfirstname'));
  const agentLast = str(pick(row, 'agentlastname'));
  const registeredAgent = [agentFirst, agentLast].filter(Boolean).join(' ') || null;

  const sector = str(pick(row, 'entitytype')); // DPC/DLLC/… — coarse; scorer refines

  const fieldSources: NonNullable<Listing['fieldSources']> = {
    title: 'source',
    location: 'source',
    yearEstablished: 'estimated', // formation date ≠ confirmed founding year
    registeredAgent: 'source',
  };

  return {
    id: `${OFF_MARKET_SOURCE}-${entityId}`,
    source: OFF_MARKET_SOURCE,
    externalId: entityId,
    listingType: 'off_market',
    title: name,
    location,
    state,
    sector,
    askingPrice: null,
    revenue: null,
    ebitda: null,
    cashFlow: null,
    yearEstablished,
    description: null,
    reasonForSelling: null,
    realEstate: null,
    financing: null,
    employees: null,
    brokerName: null,
    brokerFirm: null,
    status: str(pick(row, 'entitystatus')),
    // No known website yet → synthesize a SOS lookup URL keyed on the entity id.
    listingUrl: `https://www.sos.state.co.us/biz/BusinessEntityDetail.do?quitButtonDestination=BusinessEntityResults&masterFileId=${entityId}`,
    scrapedAt: new Date().toISOString(),
    pipelineStatus: 'scraped',
    duplicateOf: null,
    registeredAgent,
    ownerFirstLicenseDate: null,
    domainCreatedAt: null,
    siteLastUpdated: null,
    fieldSources,
  };
}
