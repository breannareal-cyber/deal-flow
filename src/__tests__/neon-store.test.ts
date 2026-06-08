import { describe, it, expect } from 'vitest';
import { rowToStoredListing, type JoinedRow } from '@/lib/storage/neon-store';
import type { Listing, Score, Research } from '@/lib/types';

// The Neon store keeps the full typed objects in jsonb columns, but projects the
// MUTABLE fields (pipelineStatus, duplicateOf, retryCount, userAction) into real
// columns. The mapper must overlay those columns over the (possibly stale) jsonb
// snapshot — otherwise a status change made via setStatus() wouldn't be visible.

function listingData(over: Partial<Listing> = {}): Listing {
  return {
    id: 'bizbuysell-12345',
    source: 'bizbuysell',
    externalId: '12345',
    title: 'Front Range Water Treatment Co.',
    location: 'Boulder, CO',
    state: 'CO',
    sector: 'Water Treatment',
    askingPrice: 2_700_000,
    revenue: 3_100_000,
    ebitda: 640_000,
    cashFlow: 700_000,
    yearEstablished: 2004,
    description: 'Municipal water testing & treatment.',
    reasonForSelling: 'Retirement',
    realEstate: 'Included in asking price',
    financing: 'Seller financing available',
    employees: 18,
    brokerName: 'Jane Broker',
    brokerFirm: 'Mountain M&A',
    status: 'Active',
    listingUrl: 'https://www.bizbuysell.com/colorado/12345/',
    scrapedAt: '2026-06-07T12:00:00Z',
    pipelineStatus: 'scraped', // intentionally stale — column should win
    duplicateOf: null,
    ...over,
  };
}

function scoreData(over: Partial<Score> = {}): Score {
  return {
    verdict: 'PURSUE',
    zone: 'CRITERIA_MATCH',
    dealKillers: [{ label: 'Affordable', status: '✅', note: 'Within structure' }],
    fitFactors: [{ label: 'Sector', value: 'Bullseye water' }],
    topQuestions: ['What is customer concentration?'],
    scoreReasoning: 'Staffed team, recurring municipal contracts.',
    summary: 'Staffed water-treatment business with recurring municipal revenue.',
    ...over,
  };
}

function researchData(over: Partial<Research> = {}): Research {
  return {
    depth: 'medium',
    summary: 'Established operator, low public risk signals.',
    webFindings: [{ title: 'County contract', url: 'https://x/y', snippet: '...' }],
    ownerInfo: 'Owner near retirement age.',
    keyRisks: ['Owner-held licenses'],
    ...over,
  };
}

function row(over: Partial<JoinedRow['listings']> = {}, score: Score | null = null, research: Research | null = null): JoinedRow {
  return {
    listings: {
      id: 'bizbuysell-12345',
      source: 'bizbuysell',
      externalId: '12345',
      pipelineStatus: 'researched', // authoritative — differs from data's 'scraped'
      scrapedAt: new Date('2026-06-07T12:00:00Z'),
      duplicateOf: null,
      retryCount: 0,
      userAction: null,
      data: listingData(),
      ...over,
    },
    scores: score ? { listingId: 'bizbuysell-12345', verdict: score.verdict, data: score, scoredAt: new Date() } : null,
    research: research ? { listingId: 'bizbuysell-12345', depth: research.depth, data: research, researchedAt: new Date() } : null,
  };
}

describe('rowToStoredListing', () => {
  it('reconstructs the full Listing from the jsonb data column', () => {
    const out = rowToStoredListing(row());
    expect(out.id).toBe('bizbuysell-12345');
    expect(out.ebitda).toBe(640_000);
    expect(out.brokerFirm).toBe('Mountain M&A'); // a field the old relational schema dropped
    expect(out.cashFlow).toBe(700_000);
    expect(out.state).toBe('CO');
  });

  it('overlays the authoritative pipelineStatus column over the stale jsonb snapshot', () => {
    const out = rowToStoredListing(row());
    expect(out.pipelineStatus).toBe('researched'); // column wins, not data's 'scraped'
  });

  it('maps a present score (incl. zone + summary the old schema lost)', () => {
    const out = rowToStoredListing(row({}, scoreData()));
    expect(out.score?.verdict).toBe('PURSUE');
    expect(out.score?.zone).toBe('CRITERIA_MATCH');
    expect(out.score?.summary).toContain('municipal');
  });

  it('returns null score/research when those rows are absent (left join miss)', () => {
    const out = rowToStoredListing(row());
    expect(out.score).toBeNull();
    expect(out.research).toBeNull();
  });

  it('maps research and surfaces userAction + retryCount from columns', () => {
    const out = rowToStoredListing(row({ userAction: 'save', retryCount: 2 }, scoreData(), researchData()));
    expect(out.research?.depth).toBe('medium');
    expect(out.research?.keyRisks).toEqual(['Owner-held licenses']);
    expect(out.userAction).toBe('save');
    expect(out.retryCount).toBe(2);
  });

  it('reflects duplicateOf from the column (set during dedup after scrape)', () => {
    const out = rowToStoredListing(row({ duplicateOf: 'bizbuysell-99999' }));
    expect(out.duplicateOf).toBe('bizbuysell-99999');
  });
});
