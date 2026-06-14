// Website + blurb enrichment for off-market candidates. The CO registry gives only
// name/city/formation-date — no website, no description — so a name filter can't
// tell a real water driller from a foundation driller or a church. This resolves
// each business's web presence to add the missing signal:
//   1. SEARCH (Tavily) for the entity by name + city  → grounded, real URLs.
//   2. CLASSIFY (Claude) the hits → official site, a 1–2 sentence blurb, the sector
//      it ACTUALLY operates in, and confidence it's the right entity in that city.
//   3. GATE (deterministic, here) → only a high-confidence sector is trusted by the
//      scorer; a proposed site is kept but flagged when confidence is low; the lead
//      is never dropped just because no website exists (phone-only legacy shops).
//
// Best-effort: every failure (no results, search/classify throws) degrades to a
// safe unenriched result — enrichment must never sink a pipeline run.

import Anthropic from '@anthropic-ai/sdk';
import { config } from '@/lib/config';
import type { WebFinding, EnrichmentSector } from '@/lib/types';
import { tavilySearch } from '@/lib/research/tavily';

export type WebsiteEnrichment = {
  website: string | null;
  websiteConfidence: 'high' | 'low' | null;
  businessDescription: string | null;
  enrichmentSector: EnrichmentSector;
  blurbSource: 'web_search' | 'site' | null;
};

// What the model returns before the deterministic gate is applied.
export type RawClassification = {
  website: string | null;
  businessDescription: string | null;
  enrichmentSector: EnrichmentSector;
  confidence: 'high' | 'low';
};

export type EntityRef = { name: string; city: string | null; state: string | null };

export type ResolveDeps = {
  search?: (query: string) => Promise<WebFinding[]>;
  classify?: (args: EntityRef & { findings: WebFinding[] }) => Promise<RawClassification>;
};

const UNENRICHED: WebsiteEnrichment = {
  website: null,
  websiteConfidence: null,
  businessDescription: null,
  enrichmentSector: 'unknown',
  blurbSource: null,
};

const VALID_SECTORS: EnrichmentSector[] = ['water', 'water_adjacent', 'not_water', 'unknown'];

export async function resolveWebsite(entity: EntityRef, deps: ResolveDeps = {}): Promise<WebsiteEnrichment> {
  const search = deps.search ?? ((q: string) => tavilySearch(q, 6));
  const classify = deps.classify ?? classifyEntity;

  try {
    const query = `${entity.name} ${entity.city ?? ''} ${entity.state ?? ''} water well pump septic`.trim();
    const findings = await search(query);
    if (!findings || findings.length === 0) return UNENRICHED;

    const raw = await classify({ ...entity, findings });

    // Deterministic gate: trust the sector only at high confidence (so a wrong-entity
    // guess can't poison scoring); keep a proposed site either way but flag low ones.
    const verified = raw.confidence === 'high';
    return {
      website: raw.website || null,
      websiteConfidence: raw.website ? raw.confidence : null,
      businessDescription: raw.businessDescription || null,
      enrichmentSector: verified ? raw.enrichmentSector : 'unknown',
      blurbSource: raw.businessDescription ? 'web_search' : null,
    };
  } catch {
    return UNENRICHED;
  }
}

// --- Real classifier (Claude). Mirrors score-listing.ts: strict JSON, defensive
// parse. Unit tests inject a stub `classify`; this path is exercised in integration. ---

const SYSTEM_PROMPT = `You identify what a small Colorado business actually does, from web search results.

You are given a business NAME, its registered CITY, and a list of web search hits (title, url, snippet). The name comes from a state business registry and may be misleading (e.g. "DRILLING" could be water-well drilling OR foundation/oil drilling; "WELL" could be a church named Wellshire).

Decide:
1. website — the business's OWN official website URL if one clearly appears in the hits, else null. Directory/aggregator pages (yelp, bbb, yellowpages, facebook, manta, zoominfo) are NOT an official website — if only those appear, website is null.
2. businessDescription — a neutral 1–2 sentence summary of what the business does, only if the hits are clearly about THIS business. Else null.
3. enrichmentSector — what it actually does:
   - "water" = an acquirable water SERVICE business: well drilling/service, pumps, septic/sewer service, water treatment/conditioning/filtration, water testing/quality labs.
   - "water_adjacent" = HVAC, plumbing, irrigation, general utility contracting.
   - "not_water" = anything off-thesis OR not an acquirable operating business — including foundation/oil drilling, churches, investment/holding cos, AND community water co-ops: subdivision / HOA / mutual / district water systems (these are member-owned utilities, not sellable companies).
   - "unknown" if the hits don't make it clear.
4. confidence — "high" if the hits clearly correspond to the named business in (or near) the given city; "low" if the city does not corroborate or the name is ambiguous across multiple businesses.

Return ONLY valid JSON, no markdown:
{"website": "https://... or null", "businessDescription": "... or null", "enrichmentSector": "water|water_adjacent|not_water|unknown", "confidence": "high|low"}`;

export async function classifyEntity(args: EntityRef & { findings: WebFinding[] }): Promise<RawClassification> {
  if (!config.anthropic.apiKey) throw new Error('anthropic key not set — cannot classify');

  const hits = args.findings
    .map((f, i) => `${i + 1}. ${f.title}\n   ${f.url}\n   ${f.snippet}`)
    .join('\n');
  const user = `NAME: ${args.name}\nCITY: ${args.city ?? '(unknown)'}, ${args.state ?? ''}\n\nSEARCH HITS:\n${hits}`;

  const client = new Anthropic({ apiKey: config.anthropic.apiKey });
  const res = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 400,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: user }],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error(`no JSON in classify response: ${text.slice(0, 200)}`);
  const parsed = JSON.parse(match[0]) as Record<string, unknown>;

  const sectorRaw = String(parsed.enrichmentSector ?? 'unknown');
  const sector = (VALID_SECTORS as string[]).includes(sectorRaw) ? (sectorRaw as EnrichmentSector) : 'unknown';
  const website = typeof parsed.website === 'string' && parsed.website.startsWith('http') ? parsed.website : null;

  return {
    website,
    businessDescription: typeof parsed.businessDescription === 'string' && parsed.businessDescription ? parsed.businessDescription : null,
    enrichmentSector: sector,
    confidence: parsed.confidence === 'high' ? 'high' : 'low',
  };
}
