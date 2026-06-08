'use client';

import { useState } from 'react';
import type { ScoredListing, Stage } from '@/lib/types';
import { HIDDEN_STAGES } from '@/lib/types';
import { ListingCard } from './listing-card';
import { ZoneModal, type ZoneKey } from './zone-modal';
import { Reveal } from '@/components/nautical/reveal';

const ZONE_MAX_3 = 3; // Zone 3 is capped

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

export function FeedClient({ listings }: { listings: ScoredListing[] }) {
  // Optimistic local stage overrides (server is source of truth on reload).
  const [stages, setStages] = useState<Record<string, Stage>>({});
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [modal, setModal] = useState<ZoneKey | null>(null);

  const stageOf = (l: ScoredListing): Stage => stages[l.id] ?? 'new';

  const handleStage = (id: string, stage: Stage) => {
    setStages((prev) => ({ ...prev, [id]: stage })); // optimistic
    fetch(`/api/listings/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage }),
    }).catch(() => {});
  };

  // Hide locally-dismissed (passed/dead) candidates + apply the type filter.
  const visible = listings.filter((l) => {
    if (HIDDEN_STAGES.includes(stageOf(l))) return false;
    if (typeFilter !== 'all' && l.listingType !== typeFilter) return false;
    return true;
  });
  const zone1 = visible.filter((l) => l.score?.zone === 'CRITERIA_MATCH');
  const zone2 = visible.filter((l) => l.score?.zone === 'WATER_OUTSIDE_SPEND');
  const zone3 = visible.filter((l) => l.score?.zone === 'SPEND_OUTSIDE_WATER').slice(0, ZONE_MAX_3);
  const unscored = visible.filter((l) => !l.score);

  const cards = (items: ScoredListing[]) => (
    <div className="flex flex-col gap-3">
      {items.map((l, i) => (
        <Reveal key={l.id} delay={Math.min(i, 4) * 50}>
          <ListingCard listing={l} stage={stageOf(l)} onStage={handleStage} />
        </Reveal>
      ))}
    </div>
  );

  const nothing = zone1.length + zone2.length + zone3.length + unscored.length === 0;

  const filters: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'off_market', label: 'Off-market' },
    { key: 'listed', label: 'Listed' },
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
