'use client';

import { useEffect } from 'react';

export type ZoneKey = 'CRITERIA_MATCH' | 'WATER_OUTSIDE_SPEND' | 'SPEND_OUTSIDE_WATER';

const BUY_BOX_ROWS: [string, string][] = [
  ['Sector', 'Water quality / environmental services / well services / water testing & treatment (bullseye). Adjacent essential-services (HVAC, utility infrastructure) = maybe.'],
  ['Size', '~$300K–$1.5M EBITDA (roughly $900K–$7.5M enterprise value at 3–5x)'],
  ['Capital', '~$150K cash down + SBA 7(a) (max $5M loan, requires ~10% equity injection) + seller note. Low equity is her tightest constraint.'],
  ['Geography', 'Colorado / Mountain West preferred; remote ownership possible'],
  ['Durability', 'Must NOT be replaceable by AI; recession-resistant; essential service'],
  ['Improvability', 'Something she can improve with her dual (technical + business) skill set'],
  ['Exit', '5-year hold → sell to PE roll-up or strategic buyer'],
  ['#1 risk to avoid', 'Key-man dependency — business that collapses when the owner leaves'],
];

const MODALS: Record<ZoneKey, { title: string; accent: string; body: React.ReactNode }> = {
  CRITERIA_MATCH: {
    title: 'The Buy Box',
    accent: '#df7d62',
    body: (
      <>
        <p className="text-sm leading-relaxed mb-5" style={{ color: '#b6bcc2' }}>
          These are the live criteria the scorer reads when matching a deal. Companies in this zone hit the bullseye —
          right sector, right size, financeable.
        </p>
        <div className="flex flex-col gap-px rounded-sm overflow-hidden" style={{ backgroundColor: '#2b3137' }}>
          {BUY_BOX_ROWS.map(([dim, target]) => (
            <div key={dim} className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-1 sm:gap-4 p-3" style={{ backgroundColor: '#15181b' }}>
              <span className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#df7d62' }}>{dim}</span>
              <span className="text-sm" style={{ color: '#ece7dd' }}>{target}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-sm border p-4" style={{ borderColor: '#d4a24a55', backgroundColor: '#1c2024' }}>
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#d4a24a' }}>⚠️ Known open tension</p>
          <p className="text-sm leading-relaxed" style={{ color: '#b6bcc2' }}>
            The buy box says &ldquo;$150K cash,&rdquo; but an SBA 7(a) deal typically requires a ~10% equity injection.
            On a $2.7M deal that&rsquo;s ~$270K — above the stated cash. This gap is bridged with a seller note covering
            part of the equity, but it needs to be resolved/confirmed. The scorer flags this gap when it appears.
          </p>
        </div>
      </>
    ),
  },
  WATER_OUTSIDE_SPEND: {
    title: 'Water Match — Outside Spend',
    accent: '#6f9aa8',
    body: (
      <>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#b6bcc2' }}>
          These are <strong style={{ color: '#ece7dd' }}>genuine water / environmental businesses</strong> — your sector
          bullseye — that fall <strong style={{ color: '#ece7dd' }}>outside your spend criteria</strong>. Usually that
          means the EBITDA is too small (under ~$300K), too large (over ~$1.5M), or simply not disclosed yet.
        </p>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#b6bcc2' }}>
          They&rsquo;re here because the sector fit is real and worth a glance — a sub-threshold well-drilling company
          might still be a foothold, and an undisclosed-EBITDA water-meter manufacturer is worth a diligence call to
          learn the numbers.
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#8b949b' }}>
          Examples of the type: water well drilling companies, water-meter / pulse-device manufacturers, septic
          services, irrigation dealers — water at the wrong size, not the wrong sector.
        </p>
      </>
    ),
  },
  SPEND_OUTSIDE_WATER: {
    title: 'In Spend — Outside Water',
    accent: '#d4a24a',
    body: (
      <>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#b6bcc2' }}>
          These sit <strong style={{ color: '#ece7dd' }}>within your spend range ($300K–$1.5M EBITDA)</strong> but{' '}
          <strong style={{ color: '#ece7dd' }}>outside the water thesis</strong>. They&rsquo;re here as a deliberate
          wildcard — capped at 3, and filtered hard for quality.
        </p>
        <p className="text-sm leading-relaxed mb-4" style={{ color: '#b6bcc2' }}>
          Only <strong style={{ color: '#ece7dd' }}>genuinely enduring, recession-resistant small businesses</strong> the
          ETA canon respects make it here — the &ldquo;dull is good&rdquo; profile from Ruback &amp; Yudkoff and Deibel:
          HVAC, pest control, document storage, specialty distribution, B2B services, niche manufacturing.
        </p>
        <p className="text-xs leading-relaxed" style={{ color: '#8b949b' }}>
          Explicitly excluded: retail, liquor / convenience stores, restaurants, bars, gas stations, e-commerce,
          salons, and consumer-fad franchises — fragile or commoditized businesses the books warn against.
        </p>
      </>
    ),
  },
};

export function ZoneModal({ zone, onClose }: { zone: ZoneKey; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const m = MODALS[zone];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(5,6,7,0.78)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-md border max-h-[85vh] overflow-y-auto"
        style={{ backgroundColor: '#0e1013', borderColor: '#2a2e34' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b sticky top-0" style={{ borderColor: '#1c1f23', backgroundColor: '#0e1013' }}>
          <h2 className="display text-lg" style={{ color: m.accent }}>{m.title}</h2>
          <button onClick={onClose} className="text-sm transition-colors hover:text-white" style={{ color: '#8b949b' }}>✕ Close</button>
        </div>
        <div className="px-6 py-6">{m.body}</div>
      </div>
    </div>
  );
}
