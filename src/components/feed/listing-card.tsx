'use client';

import Link from 'next/link';
import type { ScoredListing } from '@/lib/types';
import { formatCurrency, listingAge } from '@/lib/types';
import { VerdictBadge } from './verdict-badge';

function DataField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="eyebrow text-[10px]" style={{ color: '#8b949b' }}>{label}</span>
      <span className="figure text-base" style={{ color: '#ece7dd' }}>{value}</span>
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
      className="group relative flex flex-col gap-5 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5"
      style={{ backgroundColor: '#1c2024', border: '1px solid #2b3137' }}
    >
      {/* coral hairline lights up on hover */}
      <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{ backgroundColor: '#df7d62' }} />

      <Link href={`/listings/${listing.id}`} className="flex flex-col gap-5 px-6 pt-6 pb-0">
        <div className="flex items-center justify-between">
          {scored ? (
            <VerdictBadge verdict={verdict} />
          ) : (
            <span className="eyebrow text-[11px]" style={{ color: '#8b949b' }}>New · Unscored</span>
          )}
          <span className="figure text-xs" style={{ color: '#8b949b' }}>{listing.location ?? '—'}</span>
        </div>

        <div>
          <h2 className="display text-lg leading-tight transition-colors group-hover:text-[#df7d62]" style={{ color: '#ece7dd' }}>
            {listing.title}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#8b949b' }}>{listing.sector ?? '—'}</p>
          {isEdgeCase && listing.score?.missedDimension && (
            <p className="text-xs mt-1.5 italic" style={{ color: '#6f9aa8' }}>↳ {listing.score.missedDimension}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: '#2b3137' }}>
          <DataField label="EBITDA" value={formatCurrency(listing.ebitda)} />
          <DataField label="Ask Price" value={formatCurrency(listing.askingPrice)} />
          <DataField label="Est. Age" value={listingAge(listing.yearEstablished)} />
        </div>

        <p className="text-sm leading-relaxed pb-1" style={{ color: '#b6bcc2' }}>
          &ldquo;{summary}&rdquo;
        </p>
      </Link>

      <div className="flex items-center gap-5 px-6 pb-5 pt-1 border-t" style={{ borderColor: '#2b3137' }}>
        {onPass && (
          <button onClick={() => onPass(listing.id)} className="eyebrow text-[11px] transition-colors hover:text-[#ece7dd]" style={{ color: '#8b949b' }}>
            Throw Back
          </button>
        )}
        {onSave && (
          <button onClick={() => onSave(listing.id)} className="eyebrow text-[11px] transition-colors" style={{ color: saved ? '#df7d62' : '#8b949b' }}>
            {saved ? 'In the Hold' : 'Haul In'}
          </button>
        )}
        <Link href={`/listings/${listing.id}`} className="ml-auto eyebrow text-[11px] transition-opacity hover:opacity-60" style={{ color: '#ece7dd' }}>
          Dig Deeper →
        </Link>
      </div>
    </article>
  );
}
