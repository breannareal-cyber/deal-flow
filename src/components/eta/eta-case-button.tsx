'use client';

import { useEffect, useCallback, useState } from 'react';
import type { ETACase } from '@/lib/eta/types';

type CaseResponse = {
  currentCase: number;
  totalCases: number;
  case: ETACase;
};

// ─── helpers ────────────────────────────────────────────────────────────────

function Paragraphs({ text }: { text: string }) {
  return (
    <>
      {text.split('\n\n').map((p, i) => (
        <p key={i} className="mb-3 last:mb-0 leading-relaxed text-sm" style={{ color: '#ece7dd' }}>
          {p}
        </p>
      ))}
    </>
  );
}

function DifficultyPips({ level }: { level: number }) {
  return (
    <span className="inline-flex gap-1 items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className="inline-block w-2 h-2 rounded-full"
          style={{ backgroundColor: i < level ? '#df7d62' : '#2b3137' }}
        />
      ))}
    </span>
  );
}

function FlagList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul className="mt-2 space-y-1">
      {items.map((f, i) => (
        <li key={i} className="text-xs flex gap-2 leading-snug" style={{ color: '#8b949b' }}>
          <span className="mt-0.5 shrink-0" style={{ color }}>●</span>
          {f}
        </li>
      ))}
    </ul>
  );
}

function ConceptChips({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((c, i) => (
        <span
          key={i}
          className="eyebrow text-[9px] px-2 py-1"
          style={{ backgroundColor: '#1c2024', color: '#8b949b', border: '1px solid #2b3137' }}
        >
          {c}
        </span>
      ))}
    </div>
  );
}

// ─── main component ──────────────────────────────────────────────────────────

export function ETACaseButton() {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [data, setData] = useState<CaseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCase = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/eta/case');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as CaseResponse;
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load case');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
    setRevealed(false);
    if (!data) fetchCase();
  }, [data, fetchCase]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleAdvance = useCallback(async () => {
    setAdvancing(true);
    setRevealed(false);
    try {
      const res = await fetch('/api/eta/advance', { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await fetchCase();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to advance');
    } finally {
      setAdvancing(false);
    }
  }, [fetchCase]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, handleClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const c = data?.case;

  return (
    <>
      {/* Trigger button — matches The Hold style but coral-outlined */}
      <button
        onClick={handleOpen}
        className="eyebrow text-[11px] px-5 py-2.5 transition-colors hover:bg-[#df7d62]"
        style={{ backgroundColor: '#0e1011', color: '#df7d62', border: '1px solid #df7d62' }}
        aria-label="Open ETA study case"
      >
        Study
      </button>

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          backgroundColor: 'rgba(14,16,17,0.6)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="ETA Study Case"
        className="fixed right-0 top-0 h-full z-50 flex flex-col transition-transform duration-300 ease-out"
        style={{
          width: 'min(520px, 96vw)',
          backgroundColor: '#0e1011',
          borderLeft: '1px solid #2b3137',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: '1px solid #2b3137' }}
        >
          <div>
            <p className="eyebrow text-[9px] mb-1" style={{ color: '#8b949b' }}>
              ETA CASE CURRICULUM
            </p>
            {c ? (
              <p className="display text-base" style={{ color: '#f0ebe1' }}>
                Case {c.caseNumber}
                {data && <span className="font-normal text-xs ml-2" style={{ color: '#8b949b' }}>/ {data.totalCases}</span>}
              </p>
            ) : (
              <p className="display text-base" style={{ color: '#f0ebe1' }}>Study</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 transition-opacity hover:opacity-60"
            style={{ color: '#8b949b' }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading && (
            <p className="eyebrow text-[10px] text-center mt-12" style={{ color: '#8b949b' }}>
              Loading case…
            </p>
          )}

          {error && (
            <p className="text-xs text-center mt-12" style={{ color: '#df7d62' }}>
              {error}
            </p>
          )}

          {c && !loading && (
            <>
              {/* Case meta */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-5">
                <span className="eyebrow text-[9px]" style={{ color: '#8b949b' }}>{c.industry}</span>
                <DifficultyPips level={c.difficulty} />
                {c.source === 'pipeline' && (
                  <span className="eyebrow text-[9px] px-2 py-0.5" style={{ backgroundColor: '#1c2024', color: '#df7d62', border: '1px solid #df7d62' }}>
                    FROM PIPELINE
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="display text-xl mb-5" style={{ color: '#f0ebe1' }}>
                {c.title}
              </h2>

              {/* Case presentation */}
              <div
                className="rounded-none p-4 mb-5"
                style={{ backgroundColor: '#0e1011', border: '1px solid #2b3137' }}
              >
                <p className="eyebrow text-[9px] mb-3" style={{ color: '#8b949b' }}>CASE PRESENTATION</p>
                <Paragraphs text={c.data.company} />
              </div>

              {/* Reveal toggle */}
              {!revealed ? (
                <button
                  onClick={() => setRevealed(true)}
                  className="w-full eyebrow text-[11px] py-3 transition-colors hover:bg-[#df7d62]"
                  style={{ backgroundColor: '#df7d62', color: '#0e1011' }}
                >
                  Reveal Answer
                </button>
              ) : (
                <>
                  {/* Expert answer */}
                  <div
                    className="rounded-none p-4 mb-5"
                    style={{ backgroundColor: '#1c2024', border: '1px solid #2b3137' }}
                  >
                    <p className="eyebrow text-[9px] mb-3" style={{ color: '#df7d62' }}>EXPERT ANALYSIS</p>
                    <Paragraphs text={c.data.expertAnswer} />
                  </div>

                  {/* Teaching concepts */}
                  <div className="mb-5">
                    <p className="eyebrow text-[9px] mb-1" style={{ color: '#8b949b' }}>CONCEPTS COVERED</p>
                    <ConceptChips items={c.data.teachingConcepts} />
                  </div>

                  {/* Flags */}
                  <div className="grid grid-cols-2 gap-4 mb-5">
                    <div>
                      <p className="eyebrow text-[9px]" style={{ color: '#8b949b' }}>RED FLAGS</p>
                      <FlagList items={c.data.keyRedFlags} color="#df7d62" />
                    </div>
                    <div>
                      <p className="eyebrow text-[9px]" style={{ color: '#8b949b' }}>GREEN FLAGS</p>
                      <FlagList items={c.data.keyGreenFlags} color="#6f9aa8" />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Footer — next case */}
        {c && !loading && (
          <div
            className="shrink-0 px-6 py-4"
            style={{ borderTop: '1px solid #2b3137' }}
          >
            <button
              onClick={handleAdvance}
              disabled={advancing}
              className="w-full eyebrow text-[11px] py-3 transition-colors hover:bg-[#1c2024] disabled:opacity-40"
              style={{ backgroundColor: '#0e1011', color: '#8b949b', border: '1px solid #2b3137' }}
            >
              {advancing ? 'Loading next…' : 'Next Case →'}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
