import Link from 'next/link';
import { SiteNav, SiteFooter, NavBack } from '@/components/nautical/site-chrome';
import { TreasureChest, Cloud, Waterline } from '@/components/nautical/illustrations';

export default function SavedPage() {
  return (
    <div className="min-h-screen">
      {/* ════ Poster header (sky) ════ */}
      <header className="relative overflow-hidden">
        <SiteNav right={<NavBack href="/" label="← Feed" />} />
        <Cloud className="pointer-events-none absolute top-16 left-[14%] w-24 drift" />
        <Cloud className="pointer-events-none absolute top-24 right-[20%] w-16 drift hidden sm:block" style={{ animationDelay: '-12s' }} />

        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 pt-6 pb-16">
          <p className="eyebrow text-[11px] mb-3" style={{ color: '#45525a' }}>The Hold</p>
          <h1 className="display text-[clamp(2.5rem,6vw,4rem)]" style={{ color: '#0e1011' }}>Saved Deals</h1>
          <p className="text-[0.95rem] mt-4 max-w-md leading-relaxed" style={{ color: '#45525a' }}>
            The catches you&rsquo;re tracking. Haul a deal in from the feed and it drops into the hold.
          </p>
        </div>
        <Waterline className="block w-full h-12 -mb-px" />
      </header>

      {/* ════ Ground band (ink) ════ */}
      <main style={{ backgroundColor: '#0e1011' }}>
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="text-center py-20 px-6" style={{ border: '1px solid #2b3137' }}>
            <TreasureChest className="mx-auto h-20 w-24 bob" />
            <p className="text-sm mt-7" style={{ color: '#b6bcc2' }}>The hold is empty.</p>
            <p className="text-xs mt-2" style={{ color: '#8b949b' }}>
              Hit &ldquo;Haul In&rdquo; on any card in the feed.
            </p>
            <Link
              href="/"
              className="inline-block mt-8 eyebrow text-[11px] px-6 py-3 transition-colors hover:bg-[#df7d62]"
              style={{ backgroundColor: '#df7d62', color: '#0e1011' }}
            >
              Back to the Hunt →
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
