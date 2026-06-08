import { describe, it, expect } from 'vitest';
import { normalizeOffMarket } from '@/lib/scrapers/normalize';

// A representative Colorado Business Entities (4ykn-tg5h) row, real field names.
const ENTITY_ROW = {
  entityid: '19871234567',
  entityname: 'TRUE PUMP & EQUIPMENT, INC.',
  entitytype: 'DPC',
  entitystatus: 'Good Standing',
  entityformdate: '1972-03-31T00:00:00.000',
  principaladdress1: '123 Well St',
  principalcity: 'Denver',
  principalstate: 'CO',
  principalzipcode: '80202',
  agentfirstname: 'Jane',
  agentlastname: 'Smith',
  jurisdictonofformation: 'CO',
};

describe('normalizeOffMarket', () => {
  it('returns null without entityid or entityname', () => {
    expect(normalizeOffMarket({ entityname: 'X' })).toBeNull();
    expect(normalizeOffMarket({ entityid: '1' })).toBeNull();
  });

  it('builds an off-market Listing from a Business Entities row', () => {
    const l = normalizeOffMarket(ENTITY_ROW)!;
    expect(l).not.toBeNull();
    expect(l.listingType).toBe('off_market');
    expect(l.id).toBe('co-sos-19871234567');
    expect(l.source).toBe('co-sos');
    expect(l.externalId).toBe('19871234567');
    expect(l.title).toBe('TRUE PUMP & EQUIPMENT, INC.');
    expect(l.state).toBe('CO');
    expect(l.location).toBe('Denver, CO');
  });

  it('leaves all financial fields null (off-market = no disclosed financials)', () => {
    const l = normalizeOffMarket(ENTITY_ROW)!;
    expect(l.askingPrice).toBeNull();
    expect(l.revenue).toBeNull();
    expect(l.ebitda).toBeNull();
    expect(l.cashFlow).toBeNull();
  });

  it('derives yearEstablished from entityformdate', () => {
    const l = normalizeOffMarket(ENTITY_ROW)!;
    expect(l.yearEstablished).toBe(1972);
  });

  it('maps the registered agent (not an owner)', () => {
    const l = normalizeOffMarket(ENTITY_ROW)!;
    expect(l.registeredAgent).toBe('Jane Smith');
  });

  it('records per-field provenance in fieldSources', () => {
    const l = normalizeOffMarket(ENTITY_ROW)!;
    // entityformdate is a registry fact but a weak age proxy → low confidence
    expect(l.fieldSources?.yearEstablished).toBe('estimated');
    // name/location/agent come straight from the registry
    expect(l.fieldSources?.registeredAgent).toBe('source');
  });

  it('synthesizes a SOS entity URL when no website is known', () => {
    const l = normalizeOffMarket(ENTITY_ROW)!;
    expect(l.listingUrl).toContain('19871234567');
  });

  it('defaults existing listed listings to listingType "listed"', async () => {
    const { normalizeListing } = await import('@/lib/scrapers/normalize');
    const l = normalizeListing({ title: 'Acme', url: 'https://www.bizbuysell.com/x/2491680/' })!;
    expect(l.listingType).toBe('listed');
  });
});
