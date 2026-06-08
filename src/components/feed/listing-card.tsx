'use client';

import Link from 'next/link';
import type { ScoredListing } from '@/lib/types';
import { formatCurrency, listingAge } from '@/lib/types';
import { VerdictBadge } from './verdict-badge';

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: '#666' }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}

type Props = {
  listing: ScoredListing;
  onPass?: (id: string) => void;
  onSave?: (id: string) => void;
  saved?: boolean;
};

export function ListingCard({ listing, onPass, onSave, saved }: Props) {
  const scored = !!listing.score;
  const verdict = listing.score?.verdict ?? 'DIG_DEEPER';
  const isEdgeCase = verdict === 'EDGE_CASE';
  const summary = scored
    ? listing.score!.summary
    : listing.description?.slice(0, 160) ?? `Newly scraped from ${listing.source}. Awaiting buy-box scoring.`;

  return (
    <article
      className="rounded-sm border flex flex-col gap-5 transition-colors hover:border-white/10 overflow-hidden"
      style={{ backgroundColor: '#1a1a1a', borderColor: '#252525' }}
    >
      <Link href={`/listings/${listing.id}`} className="flex flex-col gap-5 p-6 pb-0">
        <div className="flex items-center justify-between">
          {scored ? (
            <VerdictBadge verdict={verdict} />
          ) : (
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#888' }}>NEW · UNSCORED</span>
          )}
          <span className="text-xs" style={{ color: '#666' }}>{listing.location ?? '—'}</span>
        </div>

        <div>
          <h2 className="text-xl font-bold text-white leading-tight hover:opacity-80 transition-opacity">
            {listing.title}
          </h2>
          <p className="text-sm mt-0.5" style={{ color: '#666' }}>{listing.sector ?? '—'}</p>
          {isEdgeCase && listing.score?.missedDimension && (
            <p className="text-xs mt-1.5 italic" style={{ color: '#6b9fb8' }}>
              ↳ {listing.score.missedDimension}
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: '#252525' }}>
          <DataField label="EBITDA" value={formatCurrency(listing.ebitda)} />
          <DataField label="Ask Price" value={formatCurrency(listing.askingPrice)} />
          <DataField label="Est. Age" value={listingAge(listing.yearEstablished)} />
        </div>

        <p className="text-sm leading-relaxed pb-1" style={{ color: '#999' }}>
          &ldquo;{summary}&rdquo;
        </p>
      </Link>

      <div className="flex items-center gap-5 px-6 pb-5 pt-1 border-t" style={{ borderColor: '#252525' }}>
        {onPass && (
          <button onClick={() => onPass(listing.id)} className="text-xs font-semibold tracking-wide uppercase transition-colors hover:text-white" style={{ color: '#555' }}>
            Pass ×
          </button>
        )}
        {onSave && (
          <button onClick={() => onSave(listing.id)} className="text-xs font-semibold tracking-wide uppercase transition-colors" style={{ color: saved ? '#e8715a' : '#555' }}>
            {saved ? 'Saved ✓' : 'Save ↗'}
          </button>
        )}
        <Link href={`/listings/${listing.id}`} className="ml-auto text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-70" style={{ color: '#e8715a' }}>
          Dig Deeper →
        </Link>
      </div>
    </article>
  );
}
