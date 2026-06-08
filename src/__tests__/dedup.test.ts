import { describe, it, expect } from 'vitest';
import { dedupeCrossSource } from '@/lib/scrapers/sources';
import type { Listing } from '@/lib/types';

function listing(over: Partial<Listing>): Listing {
  return {
    id: 'x', source: 'bizbuysell', externalId: 'x', listingType: 'listed', title: 't', location: null, state: null,
    sector: null, askingPrice: null, revenue: null, ebitda: null, cashFlow: null,
    yearEstablished: null, description: null, reasonForSelling: null, realEstate: null,
    financing: null, employees: null, brokerName: null, brokerFirm: null, status: 'Active',
    listingUrl: 'https://x/1', scrapedAt: '2026-06-07', pipelineStatus: 'scraped', duplicateOf: null,
    ...over,
  };
}

describe('dedupeCrossSource', () => {
  it('does NOT merge distinct businesses with identical titles but undisclosed prices', () => {
    const out = dedupeCrossSource([
      listing({ id: 'a', title: 'Commercial & Residential Specialty Water Treatment', ebitda: 350_000, askingPrice: null, listingUrl: 'https://x/a' }),
      listing({ id: 'b', title: 'Commercial & Residential Specialty Water Treatment', ebitda: 250_000, askingPrice: null, listingUrl: 'https://x/b' }),
    ]);
    expect(out[1].duplicateOf).toBeNull(); // the bug: this used to be 'a'
  });

  it('merges genuine duplicates: same listing URL', () => {
    const out = dedupeCrossSource([
      listing({ id: 'a', listingUrl: 'https://x/same' }),
      listing({ id: 'b', listingUrl: 'https://x/same' }),
    ]);
    expect(out[1].duplicateOf).toBe('a');
  });

  it('merges genuine duplicates: same title AND price within 10%', () => {
    const out = dedupeCrossSource([
      listing({ id: 'a', title: 'Acme Well Drilling', askingPrice: 1_000_000, listingUrl: 'https://x/a' }),
      listing({ id: 'b', title: 'Acme Well Drilling', askingPrice: 1_050_000, listingUrl: 'https://x/b' }),
    ]);
    expect(out[1].duplicateOf).toBe('a');
  });
});
