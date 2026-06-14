import { MOCK_LISTINGS } from '@/lib/mock-listings';
import { getStorage } from '@/lib/storage';
import { capabilities } from '@/lib/config';
import { FeedClient } from '@/components/feed/feed-client';
import { AddCandidate } from '@/components/feed/add-candidate';
import { SiteNav, SiteFooter } from '@/components/nautical/site-chrome';
import { Cloud, Waterline } from '@/components/nautical/illustrations';
import type { ScoredListing } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export default async function FeedPage() {
  const stored = await getStorage().getFeed();
  const usingReal = stored.length > 0;
  const listings: ScoredListing[] = usingReal
    ? stored
    : capabilities.showSampleData()
      ? MOCK_LISTINGS
      : [];

  const inCriteria = listings.filter((l) => l.score?.zone === 'CRITERIA_MATCH').length;
  const waterOutside = listings.filter((l) => l.score?.zone === 'WATER_OUTSIDE_SPEND').length;
  const spendOutside = Math.min(listings.filter((l) => l.score?.zone === 'SPEND_OUTSIDE_WATER').length, 3);

  return (
    <div className="min-h-screen">
      {/* ════════ POSTER HERO (overcast sky) ════════ */}
      <header className="relative overflow-hidden">
        <SiteNav />

        {/* sky decoration */}
        <Cloud className="pointer-events-none absolute top-16 left-[8%] w-24 drift" />
        <Cloud className="pointer-events-none absolute top-8 right-[26%] w-20 drift hidden sm:block" style={{ animationDelay: '-9s' }} />
        <Cloud className="pointer-events-none absolute top-4 left-[55%] w-16 drift hidden md:block" style={{ animationDelay: '-15s' }} />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 pt-0 pb-3">
          <div>
            <p className="eyebrow text-[11px] mb-1.5" style={{ color: '#2f3b41' }}>{TODAY}</p>
            <h1 className="display text-[clamp(1.6rem,3.6vw,2.4rem)] leading-[0.95]" style={{ color: '#0e1011' }}>
              Today&rsquo;s Pipeline
            </h1>
            <p className="mt-2.5 text-[0.9rem] leading-relaxed max-w-md" style={{ color: '#2f3b41' }}>
              Charting the waters for businesses worth acquiring. Every catch scored against the buy box,
              sorted by how close it swims to the bullseye.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 eyebrow text-[11px]" style={{ color: '#14181b' }}>
              <span className="inline-flex items-center gap-2"><Dot c="#df7d62" />{inCriteria} in criteria</span>
              <span className="inline-flex items-center gap-2"><Dot c="#6f9aa8" />{waterOutside} water · outside spend</span>
              <span className="inline-flex items-center gap-2"><Dot c="#d4a24a" />{spendOutside} wildcard</span>
            </div>
            {!usingReal && (
              <p className="mt-6 inline-block text-xs px-3 py-2" style={{ backgroundColor: '#7d8e96', color: '#14181b', border: '1px solid #6f828b' }}>
                Sample charts — pipeline not yet run.{' '}
                {capabilities.canScrape() ? 'Trigger a scrape to haul in real listings.' : 'Add Apify + Anthropic keys to set sail.'}
              </p>
            )}
          </div>
        </div>

        <Waterline className="block w-full h-10 sm:h-12 -mb-px" />
      </header>

      {/* ════════ GROUND BAND (ink — where the data lives) ════════ */}
      <main style={{ backgroundColor: '#0e1011' }}>
        <div className="max-w-2xl mx-auto px-6 py-14">
          <AddCandidate />
          <FeedClient listings={listings} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

function Dot({ c }: { c: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: c }} />;
}
