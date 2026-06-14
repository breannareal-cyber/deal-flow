'use client';

import Link from 'next/link';
import type { ScoredListing, Stage } from '@/lib/types';
import { formatCurrency, listingAge, pullAge } from '@/lib/types';
import { VerdictBadge } from './verdict-badge';
import { StarCompass } from './star-compass';

function StageButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="eyebrow text-[11px] py-1 -my-1 transition-colors"
      style={{ color: active ? '#df7d62' : '#8b949b' }}
    >
      {active ? `✓ ${label}` : label}
    </button>
  );
}

function StarButton({ starred, onClick, size = 18 }: { starred: boolean; onClick: () => void; size?: number }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={starred}
      aria-label={starred ? 'Unstar' : 'Star'}
      title={starred ? 'Starred' : 'Star this business'}
      className="-my-1 py-1 transition-transform duration-200 hover:scale-110"
    >
      <StarCompass filled={starred} style={{ width: size, height: size }} />
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
  starred?: boolean;
  onStage?: (id: string, stage: Stage) => void;
  onStar?: (id: string, starred: boolean) => void;
  condensed?: boolean;
};

export function ListingCard({ listing, stage = 'new', starred = false, onStage, onStar, condensed = false }: Props) {
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
  // Web-enrichment signals (off-market only): the blurb is the "what they do" the
  // registry can't give; website is the resolved official site.
  const blurb = listing.businessDescription ?? null;
  const website = listing.website ?? null;
  const enrichmentRan = isOffMarket && (!!blurb || !!listing.enrichmentSector);
  const noSiteFound = enrichmentRan && !website;
  const siteUnverified = !!website && listing.websiteConfidence === 'low';
  const summary = scored
    ? listing.score!.summary
    : listing.description?.slice(0, 160) ?? `Newly scraped from ${listing.source}. Awaiting buy-box scoring.`;
  const keyFigure = isOffMarket
    ? offMarket ? `${offMarket.weightedTotal}/5` : '—'
    : formatCurrency(listing.ebitda);

  // ── Condensed (ledger) row — one line per deal, mono figures aligned. ──
  if (condensed) {
    return (
      <div
        className="group relative flex items-center gap-4 px-5 py-3 transition-transform duration-200 hover:-translate-y-px"
        style={{ backgroundColor: '#1c2024', border: '1px solid #2b3137' }}
      >
        <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" style={{ backgroundColor: '#df7d62' }} />
        <span className="inline-block h-2 w-2 rotate-45 shrink-0" style={{ backgroundColor: scored ? '#df7d62' : '#8b949b' }} />
        <Link href={`/listings/${listing.id}`} className="display text-sm leading-none truncate flex-1 min-w-[7rem] transition-colors hover:text-[#df7d62]" style={{ color: '#ece7dd' }}>
          {listing.title}
        </Link>
        <span className="figure text-[11px] hidden sm:block w-28 truncate text-right" style={{ color: '#8b949b' }}>{listing.location ?? '—'}</span>
        <span className="figure text-xs w-16 text-right" style={{ color: '#ece7dd' }}>{keyFigure}</span>
        <span className="figure text-[10px] w-24 text-right hidden md:block" style={{ color: '#5a646b' }}>{pullAge(listing.scrapedAt)}</span>
        {onStar && <StarButton starred={starred} onClick={() => onStar(listing.id, !starred)} size={16} />}
        {onStage && (
          <div className="flex items-center gap-2.5 shrink-0">
            <StageButton label="Researched" active={stage === 'researching'} onClick={() => onStage(listing.id, 'researching')} />
            <StageButton label="Contacted" active={stage === 'contacted'} onClick={() => onStage(listing.id, 'contacted')} />
            <StageButton label="Pass" active={stage === 'passed'} onClick={() => onStage(listing.id, 'passed')} />
          </div>
        )}
      </div>
    );
  }

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
            {noSiteFound && (
              <span className="eyebrow text-[9px] px-2 py-0.5" style={{ color: '#8b949b', border: '1px solid #2b3137' }} title="No website found — judge manually">
                No site found
              </span>
            )}
          </div>
          <span className="figure text-xs" style={{ color: '#8b949b' }}>{listing.location ?? '—'}</span>
        </div>

        {offMarket?.upsideWithoutOwner && (
          // Quiet ink-bordered mark (ochre text), not a filled-coral pill — coral is
          // rationed to the disposition/verdict moment per DESIGN.md.
          <span className="self-start eyebrow text-[9px] px-2 py-0.5" style={{ color: '#d4a24a', border: '1px solid #2b3137' }}>
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

        {blurb && (
          // The web-resolved "what they do" — the signal the registry never had.
          <p className="text-sm leading-relaxed" style={{ color: '#ece7dd' }}>{blurb}</p>
        )}

        <p className="text-sm leading-relaxed pb-1" style={{ color: '#b6bcc2' }}>
          &ldquo;{summary}&rdquo;
        </p>
      </Link>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 px-6 pb-5 pt-1 border-t" style={{ borderColor: '#2b3137' }}>
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
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="eyebrow text-[11px] transition-colors hover:text-[#df7d62]"
            style={{ color: siteUnverified ? '#8b949b' : '#6f9aa8' }}
            title={siteUnverified ? 'Resolved by search — verify this is the right company' : 'Official website'}
          >
            {siteUnverified ? 'site (unverified) ↗' : 'website ↗'}
          </a>
        )}
        {/* Freshness signal — when the deal was pulled. */}
        <span className="figure text-[10px]" style={{ color: '#5a646b' }}>{pullAge(listing.scrapedAt)}</span>
        {onStage && (
          <div className="flex items-center gap-3">
            <StageButton label="Researched" active={stage === 'researching'} onClick={() => onStage(listing.id, 'researching')} />
            <StageButton label="Contacted" active={stage === 'contacted'} onClick={() => onStage(listing.id, 'contacted')} />
            <StageButton label="Pass" active={stage === 'passed'} onClick={() => onStage(listing.id, 'passed')} />
            {stage !== 'new' && (
              // One-click marking persists immediately and lands the deal in The Hold.
              <Link href="/saved" className="eyebrow text-[10px] transition-colors hover:text-[#df7d62]" style={{ color: '#8b949b' }}>
                · In the Hold ↗
              </Link>
            )}
          </div>
        )}
        {onStar && <StarButton starred={starred} onClick={() => onStar(listing.id, !starred)} />}
        <Link href={`/listings/${listing.id}`} className="ml-auto eyebrow text-[11px] transition-opacity hover:opacity-60" style={{ color: '#ece7dd' }}>
          Dig Deeper →
        </Link>
      </div>
    </article>
  );
}
