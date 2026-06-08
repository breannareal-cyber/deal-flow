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

  it('attaches staleness + domain age and records provenance', async () => {
    const enriched = await enrichOffMarket({ ...base, listingUrl: 'https://acme.com' }, {
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
      wayback: async () => null,
      whois: async () => null,
    });
    expect(enriched.siteLastUpdated).toBeNull();
    expect(enriched.domainCreatedAt).toBeNull();
  });
});
