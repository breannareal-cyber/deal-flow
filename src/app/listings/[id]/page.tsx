import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MOCK_LISTINGS } from '@/lib/mock-listings';
import { getStorage } from '@/lib/storage';
import { capabilities } from '@/lib/config';
import { formatCurrency, listingAge } from '@/lib/types';
import type { ScoredListing } from '@/lib/types';
import { VerdictBadge } from '@/components/feed/verdict-badge';
import { SiteNav, SiteFooter, NavBack } from '@/components/nautical/site-chrome';
import { Reveal } from '@/components/nautical/reveal';
import { Lighthouse, Cloud, Waterline } from '@/components/nautical/illustrations';

export const dynamic = 'force-dynamic';

const PURSUE_CHECKLIST = [
  'Order Quality of Earnings report ($15–30K, not optional)',
  'SBA pre-qualification with lender before LOI',
  'Working capital analysis (AR cycle, payroll float, seasonal swings)',
  'License & permit transfer check (CDPHE certs, contractor licenses)',
  'Deferred capex assessment (equipment age, fleet condition)',
  'Confirm seller financing appetite (10–15% seller note needed)',
];

async function getListing(id: string): Promise<ScoredListing | null> {
  const storage = getStorage();
  const stored = await storage.getById(id);
  if (stored) return stored;
  // Only fall back to mock when storage is globally empty (matches the feed's
  // mock-vs-real logic) — never mix a mock detail into a real pipeline.
  if (capabilities.showSampleData() && (await storage.count()) === 0) {
    return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
  }
  return null;
}

const SectionLabel = ({ children, accent = '#8b949b' }: { children: React.ReactNode; accent?: string }) => (
  <p className="eyebrow text-[11px] mb-4" style={{ color: accent }}>{children}</p>
);
const card = { backgroundColor: '#1c2024', border: '1px solid #2b3137' };

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const score = listing.score;
  const research = listing.research;
  const verdict = score?.verdict ?? 'DIG_DEEPER';

  return (
    <div className="min-h-screen">
      {/* ════ Poster header (sky) ════ */}
      <header className="relative overflow-hidden">
        <SiteNav right={<NavBack href="/" label="← Feed" />} />
        <Cloud className="pointer-events-none absolute top-16 left-[12%] w-24 drift" />
        <Cloud className="pointer-events-none absolute top-24 right-[30%] w-16 drift hidden sm:block" style={{ animationDelay: '-11s' }} />
        <Lighthouse className="pointer-events-none absolute bottom-0 right-[5%] w-16 sm:w-20" />

        <div className="relative max-w-3xl mx-auto px-6 sm:px-10 pt-6 pb-16">
          <div className="flex items-center justify-between mb-4">
            <VerdictBadge verdict={verdict} />
            <span className="figure text-xs" style={{ color: '#45525a' }}>{listing.location ?? '—'}</span>
          </div>
          <h1 className="display text-[clamp(2rem,5vw,3.5rem)] max-w-2xl" style={{ color: '#0e1011' }}>{listing.title}</h1>
          <p className="text-sm mt-3" style={{ color: '#45525a' }}>{listing.sector ?? '—'}</p>
          {score?.missedDimension && (
            <p className="text-xs mt-2 italic" style={{ color: '#3d5560' }}>↳ {score.missedDimension}</p>
          )}
          <div className="grid grid-cols-3 gap-6 mt-8 pt-8" style={{ borderTop: '1px solid #6f828b' }}>
            {[
              { label: 'EBITDA', value: formatCurrency(listing.ebitda) },
              { label: 'Ask Price', value: formatCurrency(listing.askingPrice) },
              { label: 'Est. Age', value: listingAge(listing.yearEstablished) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="eyebrow text-[10px] mb-1.5" style={{ color: '#45525a' }}>{label}</p>
                <p className="figure text-xl sm:text-3xl" style={{ color: '#0e1011' }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
        <Waterline className="block w-full h-12 -mb-px" />
      </header>

      {/* ════ Ground band (ink) ════ */}
      <main style={{ backgroundColor: '#0e1011' }}>
        <div className="max-w-2xl mx-auto px-6 py-14">
          {verdict === 'PURSUE' && (
            <Reveal>
              <section className="mb-10 p-6" style={{ backgroundColor: '#1c2024', border: '1px solid #df7d6255' }}>
                <SectionLabel accent="#df7d62">Before You Send an LOI</SectionLabel>
                <div className="flex flex-col gap-3">
                  {PURSUE_CHECKLIST.map((item) => (
                    <label key={item} className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-0.5 accent-[#df7d62]" />
                      <span className="text-sm leading-relaxed" style={{ color: '#b6bcc2' }}>{item}</span>
                    </label>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {score && score.dealKillers.length > 0 && (
            <Reveal>
              <section className="mb-10">
                <SectionLabel>Deal-Killer Gates</SectionLabel>
                <div className="flex flex-col gap-2">
                  {score.dealKillers.map((gate) => (
                    <div key={gate.label} className="flex items-start gap-4 p-4" style={card}>
                      <span className="text-base mt-0.5 shrink-0">{gate.status}</span>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-semibold" style={{ color: '#ece7dd' }}>{gate.label}</p>
                        <p className="text-xs leading-relaxed" style={{ color: '#8b949b' }}>{gate.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {score && score.fitFactors.length > 0 && (
            <Reveal>
              <section className="mb-10">
                <SectionLabel>Fit Factors</SectionLabel>
                <div className="grid grid-cols-1 gap-2">
                  {score.fitFactors.map((f) => (
                    <div key={f.label} className="p-4" style={card}>
                      <p className="eyebrow text-[10px] mb-1.5" style={{ color: '#8b949b' }}>{f.label}</p>
                      <p className="text-sm" style={{ color: '#ece7dd' }}>{f.value}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {research?.ownerInfo && (
            <Reveal>
              <section className="mb-10">
                <SectionLabel>Owner Profile</SectionLabel>
                <div className="p-5" style={card}>
                  <p className="text-sm leading-relaxed" style={{ color: '#b6bcc2' }}>{research.ownerInfo}</p>
                </div>
              </section>
            </Reveal>
          )}

          {score && score.topQuestions.length > 0 && (
            <Reveal>
              <section className="mb-10">
                <SectionLabel>The 3 Questions That Decide This</SectionLabel>
                <div className="flex flex-col gap-3">
                  {score.topQuestions.map((q, i) => (
                    <div key={i} className="flex items-start gap-4 p-4" style={card}>
                      <span className="figure text-base mt-0.5 shrink-0" style={{ color: '#df7d62' }}>0{i + 1}</span>
                      <p className="text-sm leading-relaxed" style={{ color: '#ece7dd' }}>{q}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {research && research.keyRisks.length > 0 && (
            <Reveal>
              <section className="mb-10">
                <SectionLabel>Key Risks</SectionLabel>
                <div className="flex flex-col gap-2">
                  {research.keyRisks.map((risk) => (
                    <div key={risk} className="flex items-start gap-3 p-4" style={card}>
                      <span className="figure text-xs font-bold mt-0.5 shrink-0" style={{ color: '#d4a24a' }}>!</span>
                      <p className="text-sm leading-relaxed" style={{ color: '#b6bcc2' }}>{risk}</p>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <div className="flex items-center gap-4 pt-6" style={{ borderTop: '1px solid #2b3137' }}>
            <Link href="/" className="eyebrow text-[11px] transition-colors hover:text-[#ece7dd]" style={{ color: '#8b949b' }}>← Back to Feed</Link>
            {listing.listingUrl && listing.listingUrl !== '#' && (
              <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer" className="ml-auto eyebrow text-[11px] px-5 py-2.5 transition-colors hover:bg-[#df7d62]" style={{ backgroundColor: '#df7d62', color: '#0e1011' }}>
                View Original Listing ↗
              </a>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
