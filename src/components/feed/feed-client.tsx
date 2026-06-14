'use client';

import { useState } from 'react';
import type { ScoredListing, Stage } from '@/lib/types';
import type { StoredListing } from '@/lib/storage';
import { HIDDEN_STAGES, newestPull, isThisTide } from '@/lib/types';
import { ListingCard } from './listing-card';
import { ZoneModal, type ZoneKey } from './zone-modal';
import { Reveal } from '@/components/nautical/reveal';
import { PROHIBITED_SECTORS } from '@/lib/scoring/buybox-config';

const ZONE_MAX_3 = 3; // Zone 3 is capped
const FRESH_MAX = 3; // only ever show the top 3 freshly-hauled candidates

// Freshly-scraped candidates have no score yet, so we gate them on text. This is
// the canonical prohibited list PLUS HVAC: HVAC is a legitimate *adjacent* sector
// that can score into "In Spend · Outside Water", so it is NOT globally prohibited —
// it's only suppressed from this unscored section to keep the bullseye prominent.
const HARD_EXCLUDE = [...PROHIBITED_SECTORS, 'hvac', 'heating & cooling', 'furnace'];
// PREFERRED: bubble these to the top of the freshly-hauled list.
const PREFERRED = [
  'water', 'well', 'environmental', 'remediation', 'wastewater',
  'stormwater', 'septic', 'testing', 'treatment', 'utility',
];

const matchesTerms = (l: ScoredListing, terms: string[]) => {
  const hay = `${l.title} ${l.sector ?? ''} ${l.description ?? ''}`.toLowerCase();
  return terms.some((t) => hay.includes(t));
};

function ZoneHeader({
  label,
  count,
  accent,
  onLearnMore,
}: {
  label: string;
  count: number;
  accent: string;
  onLearnMore: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="inline-block h-3 w-3 rotate-45" style={{ backgroundColor: accent }} />
      <p className="eyebrow text-[11px]" style={{ color: accent }}>
        {label}
        <span className="figure ml-2" style={{ color: '#8b949b', letterSpacing: 0 }}>{count}</span>
      </p>
      <button
        onClick={onLearnMore}
        className="eyebrow text-[9px] px-2 py-0.5 border transition-colors hover:text-[#ece7dd]"
        style={{ color: '#8b949b', borderColor: '#2b3137' }}
      >
        Learn more
      </button>
      <div className="flex-1 border-t" style={{ borderColor: '#2b3137' }} />
    </div>
  );
}

type TypeFilter = 'all' | 'off_market' | 'listed';

export function FeedClient({ listings }: { listings: StoredListing[] }) {
  // Optimistic local stage overrides; fall back to the persisted stage so a deal
  // marked on a previous visit still shows its disposition (and stays out / in the
  // feed) on reload — the server is the source of truth.
  const [stages, setStages] = useState<Record<string, Stage>>({});
  const [stars, setStars] = useState<Record<string, boolean>>({});
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('listed');
  const [modal, setModal] = useState<ZoneKey | null>(null);

  const stageOf = (l: StoredListing): Stage => stages[l.id] ?? l.stage ?? 'new';
  const starOf = (l: StoredListing): boolean => stars[l.id] ?? l.starred ?? false;

  const handleStage = (id: string, stage: Stage) => {
    setStages((prev) => ({ ...prev, [id]: stage })); // optimistic
    fetch(`/api/listings/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    }).catch(() => {});
  };

  const handleStar = (id: string, starred: boolean) => {
    setStars((prev) => ({ ...prev, [id]: starred })); // optimistic
    fetch(`/api/listings/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred }),
    }).catch(() => {});
  };

  // Freshness: the newest scrape "tide". Cards from this run group above older ones.
  const newestMs = newestPull(listings.map((l) => l.scrapedAt));

  // Hide locally-dismissed (passed/dead) candidates + apply the type filter.
  // Also suppress drilling companies entirely (product decision) — remove the
  // matchesTerms(l, ['drill']) check to bring them back.
  const visible = listings.filter((l) => {
    if (HIDDEN_STAGES.includes(stageOf(l))) return false;
    if (matchesTerms(l, ['drill'])) return false;
    if (typeFilter !== 'all' && l.listingType !== typeFilter) return false;
    return true;
  });
  const zone1 = visible.filter((l) => l.score?.zone === 'CRITERIA_MATCH');
  const zone2 = visible.filter((l) => l.score?.zone === 'WATER_OUTSIDE_SPEND');
  const zone3 = visible.filter((l) => l.score?.zone === 'SPEND_OUTSIDE_WATER').slice(0, ZONE_MAX_3);
  const unscored = visible
    .filter((l) => !l.score)
    .filter((l) => !matchesTerms(l, HARD_EXCLUDE)) // hard rule: no guns/jewelry/liquor/HVAC/laundromats
    .sort((a, b) => Number(matchesTerms(b, PREFERRED)) - Number(matchesTerms(a, PREFERRED))) // water/environmental first
    .slice(0, FRESH_MAX);

  const card = (l: StoredListing, i: number) => (
    <Reveal key={l.id} delay={Math.min(i, 4) * 50}>
      <ListingCard listing={l} stage={stageOf(l)} starred={starOf(l)} onStage={handleStage} onStar={handleStar} />
    </Reveal>
  );

  // Render a zone's cards newest-first, split by the current tide with a quiet
  // "earlier catches" divider so a flood of fresh pulls reads at a glance.
  const cards = (items: StoredListing[]) => {
    const sorted = [...items].sort((a, b) => (b.scrapedAt > a.scrapedAt ? 1 : -1));
    const fresh = sorted.filter((l) => isThisTide(l.scrapedAt, newestMs));
    const earlier = sorted.filter((l) => !isThisTide(l.scrapedAt, newestMs));
    return (
      <div className="flex flex-col gap-3">
        {fresh.map((l, i) => card(l, i))}
        {fresh.length > 0 && earlier.length > 0 && (
          <div className="flex items-center gap-2 mt-3 mb-1">
            <p className="eyebrow text-[9px]" style={{ color: '#5a646b' }}>Earlier catches</p>
            <div className="flex-1 border-t" style={{ borderColor: '#2b3137' }} />
          </div>
        )}
        {earlier.map((l, i) => card(l, fresh.length + i))}
      </div>
    );
  };

  const nothing = zone1.length + zone2.length + zone3.length + unscored.length === 0;

  const filters: { key: TypeFilter; label: string }[] = [
    { key: 'listed', label: 'Listed' },
    { key: 'off_market', label: 'Off-market' },
    { key: 'all', label: 'All' },
  ];

  return (
    <>
      <div className="flex items-center gap-2 mb-8">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setTypeFilter(f.key)}
            className="eyebrow text-[10px] px-3 py-1.5 transition-colors"
            style={
              typeFilter === f.key
                ? { backgroundColor: '#df7d62', color: '#0e1011' }
                : { color: '#8b949b', border: '1px solid #2b3137' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {nothing && (
        <div className="text-center py-20" style={{ color: '#8b949b' }}>
          <p className="text-sm">Calm seas — no deals in the pipeline right now.</p>
          <p className="text-xs mt-1" style={{ color: '#5a646b' }}>The next scrape runs every other day at 6am MT.</p>
        </div>
      )}

      {zone1.length > 0 && (
        <section className="mb-14">
          <ZoneHeader label="Right in Your Criteria" count={zone1.length} accent="#df7d62" onLearnMore={() => setModal('CRITERIA_MATCH')} />
          {cards(zone1)}
        </section>
      )}

      {zone2.length > 0 && (
        <section className="mb-14">
          <ZoneHeader label="Water Match · Outside Spend" count={zone2.length} accent="#6f9aa8" onLearnMore={() => setModal('WATER_OUTSIDE_SPEND')} />
          {cards(zone2)}
        </section>
      )}

      {zone3.length > 0 && (
        <section className="mb-14">
          <ZoneHeader label="In Spend · Outside Water" count={zone3.length} accent="#d4a24a" onLearnMore={() => setModal('SPEND_OUTSIDE_WATER')} />
          {cards(zone3)}
        </section>
      )}

      {unscored.length > 0 && (
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-block h-3 w-3 rotate-45" style={{ backgroundColor: '#8b949b' }} />
            <p className="eyebrow text-[11px]" style={{ color: '#8b949b' }}>
              Freshly Hauled In · Awaiting Scoring
              <span className="figure ml-2" style={{ letterSpacing: 0 }}>{unscored.length}</span>
            </p>
            <div className="flex-1 border-t" style={{ borderColor: '#2b3137' }} />
          </div>
          {cards(unscored)}
        </section>
      )}

      {modal && <ZoneModal zone={modal} onClose={() => setModal(null)} />}
    </>
  );
}
