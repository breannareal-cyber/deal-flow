import Link from 'next/link';
import { MOCK_LISTINGS } from '@/lib/mock-listings';
import { getStorage } from '@/lib/storage';
import { capabilities } from '@/lib/config';
import { FeedClient } from '@/components/feed/feed-client';
import type { ScoredListing } from '@/lib/types';

export const dynamic = 'force-dynamic';

const TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

export default async function FeedPage() {
  const stored = await getStorage().getFeed();
  const usingReal = stored.length > 0;
  const listings: ScoredListing[] = usingReal ? stored : MOCK_LISTINGS;

  const inCriteria = listings.filter((l) => l.score?.zone === 'CRITERIA_MATCH').length;
  const waterOutside = listings.filter((l) => l.score?.zone === 'WATER_OUTSIDE_SPEND').length;
  const spendOutside = Math.min(listings.filter((l) => l.score?.zone === 'SPEND_OUTSIDE_WATER').length, 3);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f0f' }}>
      <nav className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#1e1e1e' }}>
        <span className="text-sm font-black tracking-widest uppercase text-white">DEALFLOW©</span>
        <div className="flex items-center gap-6">
          <Link href="/saved" className="text-xs font-semibold tracking-widest uppercase transition-colors hover:text-white" style={{ color: '#555' }}>Saved</Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <header className="mb-10">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#666' }}>{TODAY}</p>
          <h1 className="text-3xl font-black tracking-tight text-white">Today&rsquo;s Pipeline</h1>
          <p className="text-sm mt-2" style={{ color: '#666' }}>
            {inCriteria} in criteria · {waterOutside} water/outside-spend · {spendOutside} wildcard
          </p>
          {!usingReal && (
            <p className="text-xs mt-3 px-3 py-2 rounded-sm inline-block" style={{ backgroundColor: '#1a1a1a', color: '#888', border: '1px solid #252525' }}>
              ⚠ Sample data — pipeline not yet run.{' '}
              {capabilities.canScrape() ? 'Trigger a scrape to load real listings.' : 'Add Apify + Anthropic keys to go live.'}
            </p>
          )}
        </header>

        <FeedClient listings={listings} />
      </main>

      <footer className="border-t mt-16 px-6 py-6" style={{ borderColor: '#1e1e1e' }}>
        <p className="text-xs text-center" style={{ color: '#333' }}>DEALFLOW© — Updated daily at 6am MT</p>
      </footer>
    </div>
  );
}
