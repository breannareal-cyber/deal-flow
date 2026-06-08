import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MOCK_LISTINGS } from '@/lib/mock-listings';
import { getStorage } from '@/lib/storage';
import { formatCurrency, listingAge } from '@/lib/types';
import type { ScoredListing } from '@/lib/types';
import { VerdictBadge } from '@/components/feed/verdict-badge';

export const dynamic = 'force-dynamic';

const PURSUE_CHECKLIST = [
  'Order Quality of Earnings report ($15–30K — not optional)',
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
  if ((await storage.count()) === 0) {
    return MOCK_LISTINGS.find((l) => l.id === id) ?? null;
  }
  return null;
}

export default async function ListingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  const score = listing.score;
  const research = listing.research;
  const verdict = score?.verdict ?? 'DIG_DEEPER';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0f0f0f' }}>
      <nav className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: '#1e1e1e' }}>
        <Link href="/" className="text-sm font-black tracking-widest uppercase text-white hover:opacity-70 transition-opacity">DEALFLOW©</Link>
        <Link href="/" className="text-xs font-semibold tracking-widest uppercase transition-colors hover:text-white" style={{ color: '#555' }}>← Back</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-10">
        <header className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <VerdictBadge verdict={verdict} />
            <span className="text-xs" style={{ color: '#666' }}>{listing.location ?? '—'}</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white leading-tight">{listing.title}</h1>
          <p className="text-sm mt-1" style={{ color: '#666' }}>{listing.sector ?? '—'}</p>
          {score?.missedDimension && (
            <p className="text-xs mt-2 italic" style={{ color: '#6b9fb8' }}>↳ {score.missedDimension}</p>
          )}

          <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t" style={{ borderColor: '#252525' }}>
            {[
              { label: 'EBITDA', value: formatCurrency(listing.ebitda) },
              { label: 'Ask Price', value: formatCurrency(listing.askingPrice) },
              { label: 'Est. Age', value: listingAge(listing.yearEstablished) },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#666' }}>{label}</p>
                <p className="text-2xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>
        </header>

        {verdict === 'PURSUE' && (
          <section className="mb-10 rounded-sm border p-6" style={{ backgroundColor: '#1a1a1a', borderColor: '#e8715a33' }}>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#e8715a' }}>Before You Send an LOI</p>
            <div className="flex flex-col gap-3">
              {PURSUE_CHECKLIST.map((item) => (
                <label key={item} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-[#e8715a]" />
                  <span className="text-sm leading-relaxed" style={{ color: '#999' }}>{item}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {score && score.dealKillers.length > 0 && (
          <section className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#666' }}>Deal-Killer Gates</p>
            <div className="flex flex-col gap-2">
              {score.dealKillers.map((gate) => (
                <div key={gate.label} className="flex items-start gap-4 rounded-sm border p-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#252525' }}>
                  <span className="text-base mt-0.5 shrink-0">{gate.status}</span>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold text-white">{gate.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: '#666' }}>{gate.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {score && score.fitFactors.length > 0 && (
          <section className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#666' }}>Fit Factors</p>
            <div className="grid grid-cols-1 gap-2">
              {score.fitFactors.map((f) => (
                <div key={f.label} className="rounded-sm border p-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#252525' }}>
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: '#666' }}>{f.label}</p>
                  <p className="text-sm text-white">{f.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {research?.ownerInfo && (
          <section className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#666' }}>Owner Profile</p>
            <div className="rounded-sm border p-5" style={{ backgroundColor: '#1a1a1a', borderColor: '#252525' }}>
              <p className="text-sm leading-relaxed" style={{ color: '#999' }}>{research.ownerInfo}</p>
            </div>
          </section>
        )}

        {score && score.topQuestions.length > 0 && (
          <section className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#666' }}>The 3 Questions That Decide This</p>
            <div className="flex flex-col gap-3">
              {score.topQuestions.map((q, i) => (
                <div key={i} className="flex items-start gap-4 rounded-sm border p-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#252525' }}>
                  <span className="text-xs font-black mt-0.5 shrink-0" style={{ color: '#e8715a' }}>0{i + 1}</span>
                  <p className="text-sm leading-relaxed text-white">{q}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {research && research.keyRisks.length > 0 && (
          <section className="mb-10">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: '#666' }}>Key Risks</p>
            <div className="flex flex-col gap-2">
              {research.keyRisks.map((risk) => (
                <div key={risk} className="flex items-start gap-3 rounded-sm border p-4" style={{ backgroundColor: '#1a1a1a', borderColor: '#252525' }}>
                  <span className="text-xs font-bold mt-0.5 shrink-0" style={{ color: '#d4a847' }}>!</span>
                  <p className="text-sm leading-relaxed" style={{ color: '#999' }}>{risk}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="flex items-center gap-4 pt-6 border-t" style={{ borderColor: '#252525' }}>
          <Link href="/" className="text-xs font-semibold tracking-widest uppercase transition-colors hover:text-white" style={{ color: '#555' }}>← Back to Feed</Link>
          {listing.listingUrl && listing.listingUrl !== '#' && (
            <a href={listing.listingUrl} target="_blank" rel="noopener noreferrer" className="ml-auto text-xs font-semibold tracking-widest uppercase px-5 py-2.5 rounded-sm transition-opacity hover:opacity-80" style={{ backgroundColor: '#e8715a', color: '#000' }}>
              View Original Listing ↗
            </a>
          )}
        </div>
      </main>
    </div>
  );
}
