import { describe, it, expect } from 'vitest';
import { waybackLastSnapshot } from '@/lib/enrichment/wayback';
import { domainCreatedAt } from '@/lib/enrichment/whois';
import { hostFromUrl, enrichOffMarket } from '@/lib/enrichment';
import { normalizeOffMarket } from '@/lib/scrapers/normalize';

// Tiny fetch stub: returns a canned JSON body, ok=true unless overridden.
function jsonFetch(body: unknown, ok = true): typeof fetch {
  return (async () => ({ ok, json: async () => body })) as unknown as typeof fetch;
}
const throwingFetch: typeof fetch = (async () => {
  throw new Error('network down');
}) as unknown as typeof fetch;

describe('hostFromUrl', () => {
  it('strips protocol/www/path', () => {
    expect(hostFromUrl('https://www.Example.com/foo?x=1')).toBe('example.com');
    expect(hostFromUrl('example.com')).toBe('example.com');
  });
});

describe('waybackLastSnapshot', () => {
  it('parses the latest snapshot timestamp into an ISO date', async () => {
    const body = { archived_snapshots: { closest: { timestamp: '20140513120000', available: true } } };
    expect(await waybackLastSnapshot('https://acme.com', jsonFetch(body))).toBe('2014-05-13');
  });
  it('returns null when there are no snapshots', async () => {
    expect(await waybackLastSnapshot('https://acme.com', jsonFetch({ archived_snapshots: {} }))).toBeNull();
  });
  it('returns null (does not throw) on network failure', async () => {
    expect(await waybackLastSnapshot('https://acme.com', throwingFetch)).toBeNull();
  });
});

describe('domainCreatedAt', () => {
  it('extracts the registration event date', async () => {
    const body = { events: [{ eventAction: 'registration', eventDate: '1998-07-02T00:00:00Z' }] };
    expect(await domainCreatedAt('https://acme.com', jsonFetch(body))).toBe('1998-07-02');
  });
  it('returns null when registration is redacted/absent', async () => {
    expect(await domainCreatedAt('https://acme.com', jsonFetch({ events: [] }))).toBeNull();
  });
  it('returns null (does not throw) on network failure', async () => {
    expect(await domainCreatedAt('https://acme.com', throwingFetch)).toBeNull();
  });
});

describe('enrichOffMarket', () => {
  const base = normalizeOffMarket({ entityid: '1', entityname: 'ACME PUMP CO' })!;
  // No-website resolver: keeps the existing wayback/whois behavior under test and
  // avoids the default resolver hitting the network.
  const noWebsite = async () => ({
    website: null, websiteConfidence: null, businessDescription: null,
    enrichmentSector: 'unknown' as const, blurbSource: null,
  });

  it('attaches staleness + domain age and records provenance', async () => {
    const enriched = await enrichOffMarket({ ...base, listingUrl: 'https://acme.com' }, {
      website: noWebsite,
      wayback: async () => '2014-05-13',
      whois: async () => '1998-07-02',
    });
    expect(enriched.siteLastUpdated).toBe('2014-05-13');
    expect(enriched.domainCreatedAt).toBe('1998-07-02');
    expect(enriched.fieldSources?.siteLastUpdated).toBe('source');
    expect(enriched.fieldSources?.domainCreatedAt).toBe('source');
  });

  it('leaves fields null when enrichment finds nothing (graceful)', async () => {
    const enriched = await enrichOffMarket({ ...base, listingUrl: 'https://acme.com' }, {
      website: noWebsite,
      wayback: async () => null,
      whois: async () => null,
    });
    expect(enriched.siteLastUpdated).toBeNull();
    expect(enriched.domainCreatedAt).toBeNull();
  });

  it('resolves a website and probes THAT site (not the SOS URL), with enriched provenance', async () => {
    // base.listingUrl is a synthetic SOS URL → probes would normally be skipped.
    const probed: string[] = [];
    const enriched = await enrichOffMarket(base, {
      website: async () => ({
        website: 'https://acme-pump.com', websiteConfidence: 'high',
        businessDescription: 'Water-well pump sales and service since 1965.',
        enrichmentSector: 'water', blurbSource: 'web_search',
      }),
      wayback: async (u) => { probed.push(u); return '2012-01-01'; },
      whois: async (u) => { probed.push(u); return '1999-01-01'; },
    });

    expect(enriched.website).toBe('https://acme-pump.com');
    expect(enriched.businessDescription).toMatch(/pump/i);
    expect(enriched.enrichmentSector).toBe('water');
    expect(enriched.siteLastUpdated).toBe('2012-01-01'); // probe ran against the resolved site
    expect(probed.every((u) => u.includes('acme-pump.com'))).toBe(true);
    expect(probed.some((u) => u.includes('sos.state.co.us'))).toBe(false);
    expect(enriched.fieldSources?.website).toBe('enriched');
    expect(enriched.fieldSources?.businessDescription).toBe('enriched');
    expect(enriched.fieldSources?.enrichmentSector).toBe('enriched');
  });

  it('no website found but blurb present → keeps blurb/sector, skips probes (SOS URL)', async () => {
    let probedCount = 0;
    const enriched = await enrichOffMarket(base, {
      website: async () => ({
        website: null, websiteConfidence: null,
        businessDescription: 'Phone-only legacy water-system shop since 1964.',
        enrichmentSector: 'water', blurbSource: 'web_search',
      }),
      wayback: async () => { probedCount++; return '2000-01-01'; },
      whois: async () => { probedCount++; return null; },
    });

    expect(enriched.website).toBeNull();
    expect(enriched.businessDescription).toMatch(/legacy/i);
    expect(enriched.enrichmentSector).toBe('water');
    expect(enriched.siteLastUpdated).toBeNull(); // no probe target → no staleness
    expect(probedCount).toBe(0);
  });

  it('is idempotent: already-enriched listing is not re-resolved (cost guard)', async () => {
    let resolverCalls = 0;
    const already = {
      ...base,
      website: 'https://acme-pump.com',
      enrichmentSector: 'water' as const,
      fieldSources: { ...base.fieldSources, website: 'enriched' as const },
    };
    const enriched = await enrichOffMarket(already, {
      website: async () => { resolverCalls++; return {
        website: null, websiteConfidence: null, businessDescription: null,
        enrichmentSector: 'unknown' as const, blurbSource: null,
      }; },
      wayback: async () => { resolverCalls++; return null; },
      whois: async () => { resolverCalls++; return null; },
    });
    expect(resolverCalls).toBe(0); // no search, no probes — nothing re-run
    expect(enriched.website).toBe('https://acme-pump.com'); // existing enrichment preserved
  });

  it('website resolver throwing never sinks enrichment', async () => {
    const enriched = await enrichOffMarket(base, {
      website: async () => { throw new Error('resolver blew up'); },
      wayback: async () => null,
      whois: async () => null,
    });
    expect(enriched.id).toBe(base.id); // listing returned intact
    expect(enriched.website ?? null).toBeNull();
  });
});
