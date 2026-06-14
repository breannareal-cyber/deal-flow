import { describe, it, expect, vi } from 'vitest';
import { resolveWebsite } from '@/lib/enrichment/website';
import type { WebFinding } from '@/lib/types';

// A canned set of search hits — content is irrelevant to the orchestrator (the
// injected `classify` decides), it only matters that search returned > 0 results.
const HITS: WebFinding[] = [
  { title: 'James Drilling Company', url: 'https://www.jamesdrilling.com/', snippet: 'water wells since 1957' },
];

describe('resolveWebsite', () => {
  it('clean official-site hit → high-confidence website + water sector', async () => {
    const search = vi.fn(async () => HITS);
    const classify = vi.fn(async () => ({
      website: 'https://www.jamesdrilling.com/',
      businessDescription: 'Family-owned water-well drilling, serving the Front Range since 1957.',
      enrichmentSector: 'water' as const,
      confidence: 'high' as const,
    }));

    const r = await resolveWebsite({ name: 'JAMES DRILLING CO.', city: 'Arvada', state: 'CO' }, { search, classify });

    expect(r.website).toBe('https://www.jamesdrilling.com/');
    expect(r.websiteConfidence).toBe('high');
    expect(r.businessDescription).toMatch(/water-well/i);
    expect(r.enrichmentSector).toBe('water');
    expect(r.blurbSource).toBe('web_search');
  });

  it('no own domain (directory-only) → website null but blurb kept, lead not dropped', async () => {
    const search = vi.fn(async () => HITS);
    const classify = vi.fn(async () => ({
      website: null,
      businessDescription: 'Complete local water-system source since 1964: pumps, cisterns, solar.',
      enrichmentSector: 'water' as const,
      confidence: 'high' as const,
    }));

    const r = await resolveWebsite({ name: 'WOODLAND PUMP AND SUPPLY CO.', city: 'Florissant', state: 'CO' }, { search, classify });

    expect(r.website).toBeNull();
    expect(r.websiteConfidence).toBeNull();
    expect(r.businessDescription).toMatch(/water-system/i);
    expect(r.enrichmentSector).toBe('water'); // high confidence → trusted
    expect(r.blurbSource).toBe('web_search');
  });

  it('wrong-sector false positive (name matched "drilling") → not_water', async () => {
    const search = vi.fn(async () => HITS);
    const classify = vi.fn(async () => ({
      website: 'https://elcodrilling.com/',
      businessDescription: 'Commercial & industrial FOUNDATION drilling across an 8-state region.',
      enrichmentSector: 'not_water' as const,
      confidence: 'high' as const,
    }));

    const r = await resolveWebsite({ name: 'ELCO DRILLING CO., INC.', city: 'Englewood', state: 'CO' }, { search, classify });

    expect(r.website).toBe('https://elcodrilling.com/');
    expect(r.enrichmentSector).toBe('not_water'); // scoring (Task 4) will demote despite "drilling" in name
  });

  it('low-confidence match → website kept but flagged, sector NOT trusted (unknown)', async () => {
    const search = vi.fn(async () => HITS);
    const classify = vi.fn(async () => ({
      website: 'https://some-mountain-water.com/',
      businessDescription: 'Possibly the right company — city did not corroborate.',
      enrichmentSector: 'water' as const,
      confidence: 'low' as const,
    }));

    const r = await resolveWebsite({ name: 'MOUNTAIN WATER LLC', city: 'Denver', state: 'CO' }, { search, classify });

    expect(r.website).toBe('https://some-mountain-water.com/');
    expect(r.websiteConfidence).toBe('low');
    expect(r.enrichmentSector).toBe('unknown'); // low confidence → scorer falls back to name-based fit
  });

  it('no search results → unenriched, classify never called', async () => {
    const search = vi.fn(async () => [] as WebFinding[]);
    const classify = vi.fn();

    const r = await resolveWebsite({ name: 'OBSCURE WELL CO', city: 'Nowhere', state: 'CO' }, { search, classify });

    expect(classify).not.toHaveBeenCalled();
    expect(r.website).toBeNull();
    expect(r.businessDescription).toBeNull();
    expect(r.enrichmentSector).toBe('unknown');
    expect(r.blurbSource).toBeNull();
  });

  it('search throws → returns safe unenriched result (never throws)', async () => {
    const search = vi.fn(async () => { throw new Error('tavily down'); });
    const classify = vi.fn();

    const r = await resolveWebsite({ name: 'ACME PUMP', city: 'Denver', state: 'CO' }, { search, classify });

    expect(r.website).toBeNull();
    expect(r.enrichmentSector).toBe('unknown');
  });

  it('classify throws → returns safe unenriched result (never throws)', async () => {
    const search = vi.fn(async () => HITS);
    const classify = vi.fn(async () => { throw new Error('model error'); });

    const r = await resolveWebsite({ name: 'ACME PUMP', city: 'Denver', state: 'CO' }, { search, classify });

    expect(r.website).toBeNull();
    expect(r.enrichmentSector).toBe('unknown');
  });
});
