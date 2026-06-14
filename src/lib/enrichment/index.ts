// Off-market enrichment: layer free, best-effort signals onto a candidate.
//  - Website + blurb: resolve the business's real site + a "what they do" summary,
//    and reclassify its sector from web presence (so a name false-positive like a
//    foundation driller named "...DRILLING" gets demoted by the scorer).
//  - Wayback: site staleness (last meaningful snapshot) → modernization headroom
//  - RDAP/WHOIS: domain creation date → business-age corroboration
// A resolved real website becomes the probe target (the registry only gives a
// synthetic SOS URL, which can't be probed). Each step degrades independently; any
// failure leaves the listing intact — enrichment never sinks a run.

import type { Listing } from '@/lib/types';
import { waybackLastSnapshot } from './wayback';
import { domainCreatedAt } from './whois';
import { resolveWebsite, type WebsiteEnrichment, type EntityRef } from './website';

// Bare registrable host: lowercase, no protocol, no leading www., no path.
export function hostFromUrl(url: string): string {
  let h = url.trim().toLowerCase();
  h = h.replace(/^[a-z]+:\/\//, ''); // strip protocol
  h = h.replace(/^www\./, ''); // strip leading www.
  h = h.split('/')[0].split('?')[0]; // drop path/query
  return h;
}

// Injectable probes so the orchestrator is unit-testable without network mocking.
export type EnrichDeps = {
  website?: (entity: EntityRef) => Promise<WebsiteEnrichment>;
  wayback?: (url: string) => Promise<string | null>;
  whois?: (url: string) => Promise<string | null>;
};

// A synthesized SOS lookup URL is not a real website — skip web probes for it.
function isProbableWebsite(url: string): boolean {
  return !!url && !url.includes('sos.state.co.us');
}

// City out of an off-market "City, ST" location string.
function cityOf(location: string | null): string | null {
  return location?.split(',')[0]?.trim() || null;
}

// Already web-enriched? Provenance is the source of truth — a prior run stamped
// 'enriched' on whatever it resolved. Re-enriching would re-hit Tavily + Claude for
// no new signal, so enrichment is a no-op once any web-resolved fact is present.
export function isWebEnriched(listing: Listing): boolean {
  const fs = listing.fieldSources;
  return fs?.website === 'enriched' || fs?.businessDescription === 'enriched' || fs?.enrichmentSector === 'enriched';
}

export async function enrichOffMarket(listing: Listing, deps: EnrichDeps = {}): Promise<Listing> {
  if (isWebEnriched(listing)) return listing; // idempotent: never re-resolve (cost guard)

  const resolve = deps.website ?? ((e: EntityRef) => resolveWebsite(e));
  const wayback = deps.wayback ?? ((u: string) => waybackLastSnapshot(u));
  const whois = deps.whois ?? ((u: string) => domainCreatedAt(u));

  // 1. Resolve a real website + blurb + sector (best-effort; never throws upstream).
  let web: WebsiteEnrichment;
  try {
    web = await resolve({ name: listing.title, city: cityOf(listing.location), state: listing.state });
  } catch {
    web = { website: null, websiteConfidence: null, businessDescription: null, enrichmentSector: 'unknown', blurbSource: null };
  }

  // 2. Probe the resolved site if we found one; else the listing's own URL when it's
  //    a real site (manual add). A synthetic SOS URL has nothing to probe.
  const probeUrl = web.website ?? (isProbableWebsite(listing.listingUrl) ? listing.listingUrl : null);
  let siteLastUpdated = listing.siteLastUpdated ?? null;
  let domainCreated = listing.domainCreatedAt ?? null;
  if (probeUrl) {
    const [s, d] = await Promise.all([wayback(probeUrl), whois(probeUrl)]);
    siteLastUpdated = s ?? siteLastUpdated;
    domainCreated = d ?? domainCreated;
  }

  // 3. Record provenance: probe results are 'source', web-resolved facts 'enriched'.
  const fieldSources = { ...(listing.fieldSources ?? {}) };
  if (siteLastUpdated) fieldSources.siteLastUpdated = 'source';
  if (domainCreated) fieldSources.domainCreatedAt = 'source';
  if (web.website) fieldSources.website = 'enriched';
  if (web.businessDescription) fieldSources.businessDescription = 'enriched';
  if (web.enrichmentSector && web.enrichmentSector !== 'unknown') fieldSources.enrichmentSector = 'enriched';

  return {
    ...listing,
    website: web.website ?? listing.website ?? null,
    websiteConfidence: web.websiteConfidence ?? listing.websiteConfidence ?? null,
    businessDescription: web.businessDescription ?? listing.businessDescription ?? null,
    enrichmentSector: web.enrichmentSector ?? listing.enrichmentSector ?? null,
    blurbSource: web.blurbSource ?? listing.blurbSource ?? null,
    siteLastUpdated,
    domainCreatedAt: domainCreated,
    fieldSources,
  };
}
