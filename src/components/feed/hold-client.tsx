'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Stage } from '@/lib/types';
import type { StoredListing } from '@/lib/storage';
import { ListingCard } from './listing-card';
import { Reveal } from '@/components/nautical/reveal';
import { groupHold } from '@/lib/feed-filter';

type SectionKey = 'starred' | 'researching' | 'contacted' | 'passed';

// Display order + woodcut accent. Coral is reserved for Starred (the one favorite
// moment); the dispositions take ochre / teal / slate so coral isn't repeated.
const SECTIONS: { key: SectionKey; label: string; accent: string; empty: string }[] = [
  { key: 'starred', label: 'Starred', accent: '#df7d62', empty: 'No favorites yet.' },
  { key: 'researching', label: 'Researched', accent: '#d4a24a', empty: 'Nothing in research yet.' },
  { key: 'contacted', label: 'Contacted', accent: '#6f9aa8', empty: 'No catches contacted yet.' },
  { key: 'passed', label: 'Passed', accent: '#5a646b', empty: 'Nothing passed on yet.' },
];

function SectionHeader({
  label, count, accent, collapsible, open, onToggle, view, onView,
}: {
  label: string; count: number; accent: string;
  collapsible?: boolean; open?: boolean; onToggle?: () => void;
  view?: 'cards' | 'ledger'; onView?: (v: 'cards' | 'ledger') => void;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="inline-block h-3 w-3 rotate-45 shrink-0" style={{ backgroundColor: accent }} />
      <button
        onClick={collapsible ? onToggle : undefined}
        className="eyebrow text-[11px] flex items-center gap-2"
        style={{ color: accent, cursor: collapsible ? 'pointer' : 'default' }}
      >
        {label}
        <span className="figure" style={{ color: '#8b949b', letterSpacing: 0 }}>{count}</span>
        {collapsible && <span className="text-[10px]" style={{ color: accent }}>{open ? '▲' : '▼'}</span>}
      </button>
      <div className="flex-1 border-t" style={{ borderColor: '#2b3137' }} />
      {onView && (
        <div className="flex items-center gap-1">
          {(['cards', 'ledger'] as const).map((v) => (
            <button
              key={v}
              onClick={() => onView(v)}
              className="eyebrow text-[9px] px-2 py-1 transition-colors"
              style={view === v ? { backgroundColor: '#df7d62', color: '#0e1011' } : { color: '#8b949b', border: '1px solid #2b3137' }}
            >
              {v === 'cards' ? 'Cards' : 'Ledger'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function HoldClient({ listings }: { listings: StoredListing[] }) {
  const [stages, setStages] = useState<Record<string, Stage>>({});
  const [stars, setStars] = useState<Record<string, boolean>>({});
  const [view, setView] = useState<'cards' | 'ledger'>('cards');
  const [passedOpen, setPassedOpen] = useState(false); // Passed defaults collapsed

  const stageOf = (l: StoredListing): Stage => stages[l.id] ?? l.stage ?? 'new';
  const starOf = (l: StoredListing): boolean => stars[l.id] ?? l.starred ?? false;

  const handleStage = (id: string, next: Stage) => {
    const current = stages[id] ?? listings.find((l) => l.id === id)?.stage ?? 'new';
    const target: Stage = current === next ? 'new' : next; // click active -> un-save
    setStages((prev) => ({ ...prev, [id]: target }));
    fetch(`/api/listings/${id}/action`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: target }),
    }).catch(() => {});
  };

  const handleStar = (id: string, starred: boolean) => {
    setStars((prev) => ({ ...prev, [id]: starred }));
    fetch(`/api/listings/${id}/action`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred }),
    }).catch(() => {});
  };

  // Project each listing through its effective (optimistic) stage/starred, then bucket
  // with the shared, unit-tested helper instead of re-implementing the logic here.
  const effective: StoredListing[] = listings.map((l) => ({
    ...l,
    stage: stageOf(l),
    starred: starOf(l),
  }));
  const buckets = groupHold(effective);

  const total =
    buckets.starred.length +
    buckets.researching.length +
    buckets.contacted.length +
    buckets.passed.length;

  if (total === 0) {
    return (
      <p className="text-sm text-center py-10" style={{ color: '#8b949b' }}>
        Everything you mark or star in the feed lands here.{' '}
        <Link href="/" className="transition-colors hover:text-[#df7d62]" style={{ color: '#ece7dd' }}>
          Back to the hunt &rarr;
        </Link>
      </p>
    );
  }

  return (
    // Cards read at reading width; the dense ledger uses the full ground band.
    <div className={`flex flex-col gap-14 ${view === 'cards' ? 'max-w-2xl mx-auto' : ''}`}>
      {SECTIONS.map(({ key, label, accent, empty }, idx) => {
        const items = buckets[key];
        const collapsible = key === 'passed';
        const open = !collapsible || passedOpen;
        return (
          <section key={key}>
            <SectionHeader
              label={label}
              count={items.length}
              accent={accent}
              collapsible={collapsible}
              open={open}
              onToggle={() => setPassedOpen((v) => !v)}
              view={idx === 0 ? view : undefined}
              onView={idx === 0 ? setView : undefined}
            />
            {open && (
              items.length === 0 ? (
                <p className="text-xs pl-6" style={{ color: '#5a646b' }}>{empty}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((l, i) => (
                    <Reveal key={l.id} delay={Math.min(i, 4) * 50}>
                      <ListingCard
                        listing={l}
                        stage={stageOf(l)}
                        starred={starOf(l)}
                        onStage={handleStage}
                        onStar={handleStar}
                        condensed={view === 'ledger'}
                      />
                    </Reveal>
                  ))}
                </div>
              )
            )}
          </section>
        );
      })}
    </div>
  );
}
