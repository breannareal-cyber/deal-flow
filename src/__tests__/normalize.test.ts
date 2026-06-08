import { describe, it, expect } from 'vitest';
import { parseMoney, normalizeListing } from '@/lib/scrapers/normalize';

describe('parseMoney', () => {
  it('parses plain dollar amounts', () => {
    expect(parseMoney('$1,400,000')).toBe(1_400_000);
    expect(parseMoney('500000')).toBe(500_000);
  });
  it('parses K / M suffixes', () => {
    expect(parseMoney('$500K')).toBe(500_000);
    expect(parseMoney('1.4M')).toBe(1_400_000);
    expect(parseMoney('$2.1m')).toBe(2_100_000);
  });
  it('treats undisclosed/empty as null', () => {
    expect(parseMoney('Not Disclosed')).toBeNull();
    expect(parseMoney('N/A')).toBeNull();
    expect(parseMoney('')).toBeNull();
    expect(parseMoney(null)).toBeNull();
    expect(parseMoney(undefined)).toBeNull();
  });
  it('takes a bare number literally (not as thousands)', () => {
    expect(parseMoney('500')).toBe(500); // $500, not $500K — locks current behavior
  });
});

describe('normalizeListing', () => {
  it('returns null without a url or title', () => {
    expect(normalizeListing({ title: 'X' })).toBeNull();
    expect(normalizeListing({ url: 'https://x.com/biz/1/' })).toBeNull();
  });
  it('maps shahidirfan snake_case fields', () => {
    const l = normalizeListing({
      title: 'Acme Water Treatment',
      url: 'https://www.bizbuysell.com/business-opportunity/acme/2491680/',
      location: 'Denver, CO',
      state_code: 'CO',
      price: 2_100_000,
      ebitda: 480_000,
      cash_flow: 520_000,
      year_established: 2004,
      broker_name: 'Jane Broker',
      real_estate_included_in_asking_price: true,
    });
    expect(l).not.toBeNull();
    expect(l!.externalId).toBe('2491680');
    expect(l!.ebitda).toBe(480_000);
    expect(l!.cashFlow).toBe(520_000);
    expect(l!.yearEstablished).toBe(2004);
    expect(l!.realEstate).toBe('Included in asking price');
    expect(l!.pipelineStatus).toBe('scraped');
  });
});
