// Mock data — conforms to the canonical ScoredListing shape so the UI renders
// identically whether data is mock or real-scraped. Used as fallback when the
// pipeline hasn't run yet (storage empty).

import type { ScoredListing } from './types';

function mock(
  id: string,
  listing: Partial<ScoredListing>,
  score: ScoredListing['score'],
  research: ScoredListing['research']
): ScoredListing {
  return {
    id,
    source: 'mock',
    externalId: id,
    title: '',
    location: null,
    state: null,
    sector: null,
    askingPrice: null,
    revenue: null,
    ebitda: null,
    cashFlow: null,
    yearEstablished: null,
    description: null,
    reasonForSelling: null,
    realEstate: null,
    financing: null,
    employees: null,
    brokerName: null,
    brokerFirm: null,
    status: 'Active',
    listingUrl: '#',
    scrapedAt: '2026-06-07T00:00:00Z',
    pipelineStatus: 'researched',
    duplicateOf: null,
    ...listing,
    score,
    research,
  };
}

export const MOCK_LISTINGS: ScoredListing[] = [
  mock(
    'mock-1',
    { title: 'Mountain Water Testing LLC', location: 'Colorado Springs, CO', sector: 'Water testing & treatment', askingPrice: 2100000, ebitda: 480000, yearEstablished: 2004 },
    {
      verdict: 'PURSUE',
      zone: 'CRITERIA_MATCH',
      summary: '14 municipal contracts, management team in place, owner retiring. EBITDA CPA-verified. No client over 11% of revenue.',
      scoreReasoning: 'Passes all hard gates with strong sector and operator fit. The rare deal worth chasing.',
      dealKillers: [
        { label: 'Affordable on her structure', status: '✅', note: '$2.1M ask — ~$210K equity injection + seller note covers gap.' },
        { label: 'Key-man risk', status: '✅', note: 'Management team in place. Owner not client-facing.' },
        { label: 'Customer concentration', status: '✅', note: '14 municipal contracts. Top client = 11% of revenue.' },
        { label: 'Durability (AI/disruption)', status: '✅', note: 'Physical water testing cannot be automated away.' },
        { label: 'EBITDA quality', status: '✅', note: 'CPA-verified. Addbacks limited to owner salary ($120K).' },
        { label: 'SBA eligibility', status: '✅', note: 'B2B services, diversified revenue — strong SBA fit.' },
        { label: 'Working capital', status: '⚠️', note: 'Municipal AR 45–60 days. ~$80K WC needed at close.' },
      ],
      fitFactors: [
        { label: 'Sector fit', value: 'Bullseye — water testing is your strongest domain match.' },
        { label: 'Recurring revenue', value: 'Municipal contracts renew annually. High stickiness.' },
        { label: 'Operator fit', value: 'Bio/chem background directly applicable to testing protocols.' },
        { label: 'Exit path', value: 'Water testing labs are PE roll-up targets. 5-yr exit realistic.' },
      ],
      topQuestions: [
        'Are the municipal contracts assignable on ownership transfer without re-bid?',
        'What is the age and replacement schedule of the core lab equipment?',
        'Will the owner carry a 10–15% seller note at market terms?',
      ],
    },
    {
      depth: 'medium',
      summary: 'Founded 2004 by a former Colorado Dept. of Public Health scientist. Listed quietly, no broker — retirement-motivated.',
      ownerInfo: 'Owner founded the business in 2004 after 15 years at CDPHE. Retirement-motivated, Colorado Springs.',
      keyRisks: ['Municipal contract re-bid risk on transfer', 'Working capital gap (~$80K) not in SBA loan', 'Lab equipment age unknown — deferred capex'],
      webFindings: [],
    }
  ),
  mock(
    'mock-2',
    { title: 'Front Range Well Services', location: 'Fort Collins, CO', sector: 'Well drilling & maintenance', askingPrice: 1800000, ebitda: 390000, yearEstablished: 2008 },
    {
      verdict: 'DIG_DEEPER',
      zone: 'CRITERIA_MATCH',
      summary: 'Strong recurring residential base. Lead driller tenure 15 yrs but license-holder status unknown. Equipment age undisclosed.',
      scoreReasoning: 'Passes hard gates but key-man and EBITDA-quality flags need diligence before committing.',
      dealKillers: [
        { label: 'Affordable on her structure', status: '✅', note: '$1.8M ask — within SBA + seller note range.' },
        { label: 'Key-man risk', status: '⚠️', note: 'If lead driller holds the CO license personally, departure = pause.' },
        { label: 'Customer concentration', status: '✅', note: 'Residential base — fragmented by nature.' },
        { label: 'Durability (AI/disruption)', status: '✅', note: 'Physical well drilling is irreplaceable.' },
        { label: 'EBITDA quality', status: '⚠️', note: 'Addbacks not disclosed. SDE vs EBITDA unclear.' },
        { label: 'SBA eligibility', status: '✅', note: 'Drilling services — standard SBA eligible.' },
        { label: 'Working capital', status: '?', note: 'Seasonal residential demand — WC needs unknown.' },
      ],
      fitFactors: [
        { label: 'Sector fit', value: 'Strong — well services within your core domain.' },
        { label: 'Recurring revenue', value: 'Maintenance contracts base; drilling is project-based.' },
        { label: 'Operator fit', value: 'Technical background applicable. Licensing may be required.' },
        { label: 'Exit path', value: 'Strategic buyer more likely than PE at this size.' },
      ],
      topQuestions: [
        'Does the lead driller hold the CO Well Contractor License personally or the company?',
        'What is the average age of the drilling rig fleet and capex schedule?',
        'Is $390K SDE or EBITDA, and what are the specific addbacks?',
      ],
    },
    {
      depth: 'medium',
      summary: 'Operating since 2008. Listed via Mountain West Business Sales. Owner not retirement age — motivation worth probing.',
      ownerInfo: 'Owner since 2008, not retirement age. Reason for selling unstated — ask why now.',
      keyRisks: ['Lead driller key-man — CO license portability unknown', 'EBITDA quality unverified', 'Equipment fleet age undisclosed — capex risk'],
      webFindings: [],
    }
  ),
  mock(
    'mock-3',
    { title: 'Summit HVAC & Utility Services', location: 'Denver, CO', sector: 'HVAC & utilities', askingPrice: 2700000, ebitda: 580000, yearEstablished: 2011 },
    {
      verdict: 'EDGE_CASE',
      zone: 'SPEND_OUTSIDE_WATER',
      missedDimension: 'Adjacent sector — not water',
      summary: 'Strong recurring commercial contracts, low key-man risk. Adjacent to water infrastructure — less operator fit for your background.',
      scoreReasoning: 'Clean business that passes every gate, but sits in an adjacent sector where your technical edge doesn\'t apply.',
      dealKillers: [
        { label: 'Affordable on her structure', status: '✅', note: '$2.7M — manageable with SBA + seller note.' },
        { label: 'Key-man risk', status: '✅', note: 'Technician team in place. Owner semi-absentee.' },
        { label: 'Customer concentration', status: '✅', note: '30+ commercial clients, none >15%.' },
        { label: 'Durability (AI/disruption)', status: '✅', note: 'Physical HVAC maintenance cannot be automated.' },
        { label: 'EBITDA quality', status: '✅', note: 'CPA-reviewed. Standard HVAC margins.' },
        { label: 'SBA eligibility', status: '✅', note: 'HVAC services — textbook SBA deal.' },
        { label: 'Working capital', status: '✅', note: 'Commercial contracts with deposits. WC manageable.' },
      ],
      fitFactors: [
        { label: 'Sector fit', value: 'Adjacent — utility/infrastructure, but not your water expertise.' },
        { label: 'Recurring revenue', value: 'Maintenance contracts strong.' },
        { label: 'Operator fit', value: 'Less fit — your technical edge doesn\'t apply directly.' },
        { label: 'Exit path', value: 'HVAC is active PE roll-up sector.' },
      ],
      topQuestions: [
        'What portion of revenue is maintenance contracts vs. new installs?',
        'What is technician turnover and average tenure?',
        'Will the seller stay on for a 6-month transition?',
      ],
    },
    {
      depth: 'medium',
      summary: 'Founded 2011, semi-absentee for 3 years. Owner selling to focus on real estate. Broker-represented.',
      ownerInfo: 'Founded 2011. Semi-absentee 3 years. Selling to focus on real estate.',
      keyRisks: ['Your technical background doesn\'t apply', 'Competitive Denver HVAC market — many buyers', 'Less differentiated in diligence'],
      webFindings: [],
    }
  ),
];
