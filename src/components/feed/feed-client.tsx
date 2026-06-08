'use client';

import { useState } from 'react';
import type { ScoredListing } from '@/lib/types';
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

export function FeedClient({ listings }: { listings: ScoredListing[] }) {
  const [passed, setPassed] = useState<Set<string>>(new Set());
  const [saved, setSaved] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ZoneKey | null>(null);

  const record = (id: string, action: 'pass' | 'save') => {
    fetch(`/api/listings/${id}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    }).catch(() => {});
  };
  const handlePass = (id: string) => {
    setPassed((prev) => new Set([...prev, id]));
    record(id, 'pass');
  };
  const handleSave = (id: string) => {
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); // un-save: local only for now (see /saved TODO)
      else { next.add(id); record(id, 'save'); }
      return next;
    });
  };

  const visible = listings.filter((l) => !passed.has(l.id));
  const zone1 = visible.filter((l) => l.score?.zone === 'CRITERIA_MATCH');
  const zone2 = visible.filter((l) => l.score?.zone === 'WATER_OUTSIDE_SPEND');
  const zone3 = visible.filter((l) => l.score?.zone === 'SPEND_OUTSIDE_WATER').slice(0, ZONE_MAX_3);
  const unscored = visible.filter((l) => !l.score);

  const cards = (items: ScoredListing[]) => (
    <div className="flex flex-col gap-3">
      {items.map((l, i) => (
        <Reveal key={l.id} delay={Math.min(i, 4) * 50}>
          <ListingCard listing={l} onPass={handlePass} onSave={handleSave} saved={saved.has(l.id)} />
        </Reveal>
      ))}
    </div>
  );

  const nothing = zone1.length + zone2.length + zone3.length + unscored.length === 0;

  return (
    <>
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
