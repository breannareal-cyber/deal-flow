// Off-market enrichment: layer free, best-effort signals onto a candidate.
//  - Wayback: site staleness (last meaningful snapshot) → modernization headroom
//  - RDAP/WHOIS: domain creation date → business-age corroboration
// Each probe degrades to null independently; a failed probe never sinks the others.

import type { Listing } from '@/lib/types';
import { waybackLastSnapshot } from './wayback';
import { domainCreatedAt } from './whois';

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
  wayback?: (url: string) => Promise<string | null>;
  whois?: (url: string) => Promise<string | null>;
};

// A synthesized SOS lookup URL is not a real website — skip web probes for it.
function isProbableWebsite(url: string): boolean {
  return !!url && !url.includes('sos.state.co.us');
}

export async function enrichOffMarket(listing: Listing, deps: EnrichDeps = {}): Promise<Listing> {
  const wayback = deps.wayback ?? ((u: string) => waybackLastSnapshot(u));
  const whois = deps.whois ?? ((u: string) => domainCreatedAt(u));

  if (!isProbableWebsite(listing.listingUrl)) return listing;

  const [siteLastUpdated, domainCreated] = await Promise.all([
    wayback(listing.listingUrl),
    whois(listing.listingUrl),
  ]);

  const fieldSources = { ...(listing.fieldSources ?? {}) };
  if (siteLastUpdated) fieldSources.siteLastUpdated = 'source';
  if (domainCreated) fieldSources.domainCreatedAt = 'source';

  return {
    ...listing,
    siteLastUpdated: siteLastUpdated ?? listing.siteLastUpdated ?? null,
    domainCreatedAt: domainCreated ?? listing.domainCreatedAt ?? null,
    fieldSources,
  };
}
