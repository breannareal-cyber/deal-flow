// Craigslist public business-for-sale scraper. No bot protection — clean static
// HTML. Low-signal for the buy box (skews small/equipment) but real, and proves
// the multi-source pipeline. The scorer correctly PASSes most of it.

import type { Listing } from '@/lib/types';
import { parseMoney } from '@/lib/scrapers/normalize';

// Mountain West Craigslist regions (subdomains). Denver carries the most.
const CITIES = (process.env.CRAIGSLIST_CITIES ??
  'denver,boulder,cosprings,fortcollins,saltlakecity')
  .split(',').map((c) => c.trim()).filter(Boolean);

const KEYWORDS = (process.env.CRAIGSLIST_KEYWORDS ??
  'water,well,septic,environmental')
  .split(',').map((k) => k.trim()).filter(Boolean);

const MIN_PRICE = Number(process.env.CRAIGSLIST_MIN_PRICE ?? 25000); // cut the junk

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

function extractId(url: string): string {
  const m = url.match(/\/(\d+)\.html/);
  return m ? m[1] : url;
}

function parseResults(html: string, city: string): Listing[] {
  const out: Listing[] = [];
  // Static search results: <li class="cl-static-search-result" title="..."> ... </li>
  const itemRe = /<li class="cl-static-search-result"[^>]*title="([^"]*)"[^>]*>([\s\S]*?)<\/li>/g;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(html)) !== null) {
    const title = decodeHtml(m[1]);
    const body = m[2];
    const link = body.match(/href="([^"]+)"/)?.[1];
    if (!link) continue;
    const priceRaw = body.match(/class="price"[^>]*>\s*\$?([\d,]+)/)?.[1] ?? body.match(/\$([\d,]+)/)?.[1];
    const location = body.match(/class="location"[^>]*>([^<]*)</)?.[1]?.trim() ?? null;
    const askingPrice = parseMoney(priceRaw);

    const externalId = extractId(link);
    out.push({
      id: `craigslist-${externalId}`,
      source: 'craigslist',
      externalId,
      listingType: 'listed',
      title,
      location: location ? `${location}, (${city})` : city,
      state: null,
      sector: 'Business for sale (Craigslist)',
      askingPrice,
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
      status: 'Active',
      listingUrl: link,
      scrapedAt: new Date().toISOString(),
      pipelineStatus: 'scraped',
      duplicateOf: null,
    });
  }
  return out;
}

function decodeHtml(s: string): string {
  return s
    .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
}

async function fetchCity(city: string, keyword: string): Promise<Listing[]> {
  const url = `https://${city}.craigslist.org/search/bfs?query=${encodeURIComponent(keyword)}&min_price=${MIN_PRICE}&sort=date`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA }, redirect: 'follow' });
    if (!res.ok) return [];
    return parseResults(await res.text(), city);
  } catch {
    return [];
  }
}

export const craigslistSource = {
  name: 'craigslist',
  enabled: () => true,
  async scrape(): Promise<Listing[]> {
    const byId = new Map<string, Listing>();
    for (const city of CITIES) {
      for (const keyword of KEYWORDS) {
        const listings = await fetchCity(city, keyword);
        for (const l of listings) if (!byId.has(l.id)) byId.set(l.id, l);
        await new Promise((r) => setTimeout(r, 300)); // be polite
      }
    }
    return [...byId.values()];
  },
};
