'use client';

import Link from 'next/link';
import type { ScoredListing, Stage } from '@/lib/types';
import { formatCurrency, listingAge } from '@/lib/types';
import { VerdictBadge } from './verdict-badge';

function StageButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="eyebrow text-[11px] transition-colors"
      style={{ color: active ? '#df7d62' : '#8b949b' }}
    >
      {active ? `✓ ${label}` : label}
    </button>
  );
}

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
  stage?: Stage;
  onStage?: (id: string, stage: Stage) => void;
};

export function ListingCard({ listing, stage = 'new', onStage }: Props) {
  const scored = !!listing.score;
  const verdict = listing.score?.verdict ?? 'DIG_DEEPER';
  const isEdgeCase = verdict === 'EDGE_CASE';
  const isMock = listing.source === 'mock';
  const isOffMarket = listing.listingType === 'off_market';
  const offMarket = listing.score?.offMarket;
  const sourceLabel = ({
    bizbuysell: 'BizBuySell',
    craigslist: 'Craigslist',
    'co-sos': 'CO Registry',
    manual: 'Added by you',
  } as Record<string, string>)[listing.source] ?? listing.source;
  const hasSourceLink = !isMock && !!listing.listingUrl && listing.listingUrl !== '#';
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
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {scored ? (
              <VerdictBadge verdict={verdict} />
            ) : (
              <span className="eyebrow text-[11px]" style={{ color: '#8b949b' }}>New · Unscored</span>
            )}
            {isOffMarket && (
              <span className="eyebrow text-[9px] px-2 py-0.5" style={{ color: '#6f9aa8', border: '1px solid #2b3137' }}>
                Off-market
              </span>
            )}
          </div>
          <span className="figure text-xs" style={{ color: '#8b949b' }}>{listing.location ?? '—'}</span>
        </div>

        {offMarket?.upsideWithoutOwner && (
          <span className="self-start eyebrow text-[9px] px-2 py-0.5" style={{ backgroundColor: '#df7d62', color: '#0e1011' }}>
            ★ Upside without the owner
          </span>
        )}

        <div>
          <h2 className="display text-lg leading-tight transition-colors group-hover:text-[#df7d62]" style={{ color: '#ece7dd' }}>
            {listing.title}
          </h2>
          <p className="text-sm mt-1" style={{ color: '#8b949b' }}>{listing.sector ?? '—'}</p>
          {isEdgeCase && listing.score?.missedDimension && (
            <p className="text-xs mt-1.5 italic" style={{ color: '#6f9aa8' }}>↳ {listing.score.missedDimension}</p>
          )}
        </div>

        {isOffMarket ? (
          // Off-market has no disclosed financials — show the signals we DO have.
          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: '#2b3137' }}>
            <DataField label="Founded" value={listing.yearEstablished ? `${listing.yearEstablished}` : '—'} />
            <DataField label="Fit (est.)" value={offMarket ? `${offMarket.weightedTotal}/5` : '—'} />
            <DataField label="Est. Age" value={listingAge(listing.yearEstablished)} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t" style={{ borderColor: '#2b3137' }}>
            <DataField label="EBITDA" value={formatCurrency(listing.ebitda)} />
            <DataField label="Ask Price" value={formatCurrency(listing.askingPrice)} />
            <DataField label="Est. Age" value={listingAge(listing.yearEstablished)} />
          </div>
        )}

        <p className="text-sm leading-relaxed pb-1" style={{ color: '#b6bcc2' }}>
          &ldquo;{summary}&rdquo;
        </p>
      </Link>

      <div className="flex items-center gap-5 px-6 pb-5 pt-1 border-t" style={{ borderColor: '#2b3137' }}>
        {isMock ? (
          <span className="eyebrow text-[10px] px-2 py-0.5" style={{ color: '#6f9aa8', border: '1px solid #2b3137' }}>
            Sample
          </span>
        ) : hasSourceLink ? (
          <a
            href={listing.listingUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow text-[11px] transition-colors hover:text-[#df7d62]"
            style={{ color: '#8b949b' }}
          >
            via {sourceLabel} ↗
          </a>
        ) : (
          <span className="eyebrow text-[11px]" style={{ color: '#8b949b' }}>via {sourceLabel}</span>
        )}
        {onStage && (
          <div className="flex items-center gap-3">
            <StageButton label="Research" active={stage === 'researching'} onClick={() => onStage(listing.id, 'researching')} />
            <StageButton label="Contacted" active={stage === 'contacted'} onClick={() => onStage(listing.id, 'contacted')} />
            <StageButton label="Pass" active={stage === 'passed'} onClick={() => onStage(listing.id, 'passed')} />
          </div>
        )}
        <Link href={`/listings/${listing.id}`} className="ml-auto eyebrow text-[11px] transition-opacity hover:opacity-60" style={{ color: '#ece7dd' }}>
          Dig Deeper →
        </Link>
      </div>
    </article>
  );
}
