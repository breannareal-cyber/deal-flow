// Woodcut / scratchboard nautical illustrations — Epicurrence "OBX" aesthetic.
// Two-tone: ink (#0e1011) solid masses + paper (#f0ebe1) scratch highlights, one coral spot.
// See docs/DESIGN.md. All decorative; callers add aria-hidden + pointer-events-none.
import type { SVGProps } from 'react';

const INK = '#0e1011';
const PAPER = '#f0ebe1';
const CORAL = '#df7d62';
const WASH = '#b9c4c6'; // pale interior wash inside the medallion porthole

type Illo = SVGProps<SVGSVGElement>;
const base = (p: Illo) => ({ fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true as const, ...p });

/* ────────────────────────────────────────────────────────────────────────
   MEDALLION — the hero centerpiece. An octopus curling around a porthole
   scene of a rising sun + cresting wave, coral hand-wordmark arched below.
   ──────────────────────────────────────────────────────────────────────── */
export function Medallion({ label = 'DEALFLOW', ...props }: Illo & { label?: string }) {
  return (
    <svg viewBox="0 0 260 268" {...base(props)}>
      <defs>
        <clipPath id="porthole">
          <circle cx="130" cy="128" r="92" />
        </clipPath>
        {/* arc sitting in the lower (ink) half, text rides above it */}
        <path id="arc" d="M 58 150 A 72 72 0 0 0 202 150" fill="none" />
      </defs>

      {/* one tasteful tentacle draping over the top-right of the ring */}
      <g fill={INK}>
        <path d="M188 58 C224 42 250 70 246 100 C243 122 224 130 216 118 C230 114 236 94 224 86 C212 78 198 90 204 106 C192 92 178 72 188 58 Z" />
      </g>
      <g fill={PAPER}>
        <circle cx="232" cy="92" r="2" /><circle cx="222" cy="106" r="1.7" /><circle cx="214" cy="74" r="1.7" />
      </g>

      {/* porthole scene */}
      <g clipPath="url(#porthole)">
        <rect x="38" y="32" width="184" height="200" fill={WASH} />
        {/* sea */}
        <rect x="38" y="128" width="184" height="104" fill={INK} />
        {/* rising sun + rays */}
        <circle cx="130" cy="94" r="22" fill={PAPER} />
        <g stroke={INK} strokeWidth="3" strokeLinecap="round">
          <path d="M130 52 V64 M130 124 V136 M86 94 H98 M162 94 H174 M100 64 L109 73 M160 64 L151 73 M100 124 L109 115 M160 124 L151 115" />
        </g>
        {/* calm horizon reflections in the sea */}
        <g stroke={PAPER} strokeWidth="2" strokeLinecap="round" opacity="0.45">
          <path d="M70 144 H110 M150 144 H190 M84 156 H124 M150 156 H184" />
        </g>
      </g>

      {/* ring */}
      <circle cx="130" cy="128" r="92" fill="none" stroke={INK} strokeWidth="9" />
      <circle cx="130" cy="128" r="99" fill="none" stroke={INK} strokeWidth="1.5" opacity="0.55" />

      {/* coral arched wordmark */}
      <text fill={CORAL} fontFamily="var(--font-archivo), sans-serif" fontWeight={800} letterSpacing="0.5">
        <textPath href="#arc" startOffset="50%" textAnchor="middle" style={{ fontSize: 30 }}>{label}</textPath>
      </text>
    </svg>
  );
}

/* ── Flat cream cloud ── */
export function Cloud(props: Illo) {
  return (
    <svg viewBox="0 0 120 50" {...base(props)}>
      <path
        fill={PAPER}
        d="M18 44 C6 44 2 30 14 26 C12 14 28 10 34 18 C38 6 60 6 62 20 C76 12 92 22 86 34 C100 34 102 44 90 44 Z"
      />
    </svg>
  );
}

/* ── Cape Hatteras (OBX) lighthouse — black/cream diagonal stripes ── */
export function Lighthouse(props: Illo) {
  return (
    <svg viewBox="0 0 90 200" {...base(props)}>
      {/* tower body */}
      <path fill={PAPER} stroke={INK} strokeWidth="2" d="M33 56 L29 168 H61 L57 56 Z" />
      {/* diagonal candy stripes */}
      <g fill={INK}>
        <path d="M33 56 L46 56 L31 92 L30 78 Z" />
        <path d="M52 56 L57 56 L58 70 L40 110 L31 110 L33 96 Z" />
        <path d="M58 86 L59 104 L37 150 L30 150 L31 130 Z" />
        <path d="M59 120 L60 140 L42 168 L33 168 L31 162 Z" />
      </g>
      <rect x="31" y="166" width="32" height="6" fill={INK} />
      {/* lantern room */}
      <path fill={INK} d="M32 56 H58 L54 40 H36 Z" />
      <rect x="37" y="24" width="16" height="16" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path fill={INK} d="M35 24 H55 L45 12 Z" />
      {/* beams */}
      <g stroke={CORAL} strokeWidth="2" strokeLinecap="round" opacity="0.8">
        <path d="M55 30 L78 22 M55 36 L78 40" />
      </g>
      {/* rocks */}
      <path fill={INK} d="M14 184 C30 174 60 174 80 184 C84 187 84 192 80 192 H18 C12 192 10 187 14 184 Z" />
    </svg>
  );
}

/* ── Torn-ink waterline — full-bleed edge between sky and ground ── */
export function Waterline({ flip = false, ...props }: Illo & { flip?: boolean }) {
  return (
    <svg viewBox="0 0 1440 60" preserveAspectRatio="none" {...base(props)} style={{ transform: flip ? 'scaleY(-1)' : undefined, ...props.style }}>
      <path
        fill={INK}
        d="M0 60 V30 C60 22 120 40 190 34 C260 28 300 12 380 18 C450 23 500 40 580 32 C660 24 700 8 790 16 C870 23 920 42 1010 34 C1090 27 1140 12 1230 20 C1310 27 1370 40 1440 30 V60 Z"
      />
      {/* spray dots above the line */}
      <g fill={INK}>
        <circle cx="240" cy="20" r="2.5" /><circle cx="520" cy="22" r="2" /><circle cx="760" cy="12" r="2.5" />
        <circle cx="980" cy="24" r="2" /><circle cx="1180" cy="16" r="2.5" /><circle cx="1320" cy="22" r="2" />
      </g>
    </svg>
  );
}

/* ── Woodcut spot motifs (zone markers, footer) ── */
export function Compass(props: Illo) {
  return (
    <svg viewBox="0 0 48 48" {...base(props)}>
      <circle cx="24" cy="24" r="21" fill={INK} />
      <circle cx="24" cy="24" r="21" fill="none" stroke={PAPER} strokeWidth="1.5" />
      <path fill={CORAL} d="M24 8 L29 24 L24 28 Z" />
      <path fill={PAPER} d="M24 40 L19 24 L24 20 Z" />
      <path fill={PAPER} d="M8 24 L24 19 L28 24 Z M40 24 L24 29 L20 24 Z" opacity="0.85" />
      <circle cx="24" cy="24" r="2" fill={CORAL} />
    </svg>
  );
}

export function Anchor(props: Illo) {
  return (
    <svg viewBox="0 0 48 56" {...base(props)}>
      <g fill={INK}>
        <circle cx="24" cy="9" r="6" />
        <rect x="21" y="13" width="6" height="34" rx="2" />
        <rect x="12" y="22" width="24" height="5" rx="2" />
        <path d="M8 30 C8 46 22 50 24 50 C26 50 40 46 40 30 L34 34 C33 42 28 44 24 44 C20 44 15 42 14 34 Z" />
      </g>
      <circle cx="24" cy="9" r="2.4" fill={PAPER} />
    </svg>
  );
}

export function Fish(props: Illo) {
  return (
    <svg viewBox="0 0 60 32" {...base(props)}>
      <path fill={INK} d="M4 16 C18 2 44 2 50 16 C44 30 18 30 4 16 Z" />
      <path fill={INK} d="M50 16 L60 6 L58 16 L60 26 Z" />
      <circle cx="16" cy="13" r="2" fill={PAPER} />
      <path stroke={PAPER} strokeWidth="1.5" fill="none" d="M26 8 C32 14 32 18 26 24" opacity="0.7" />
    </svg>
  );
}

export function MapX(props: Illo) {
  return (
    <svg viewBox="0 0 48 48" {...base(props)}>
      <circle cx="24" cy="24" r="20" fill={INK} />
      <path stroke={CORAL} strokeWidth="4" strokeLinecap="round" d="M15 15 L33 33 M33 15 L15 33" />
    </svg>
  );
}

export function TreasureChest(props: Illo) {
  return (
    <svg viewBox="0 0 120 96" {...base(props)}>
      {/* chest body + domed lid */}
      <g fill={INK}>
        <path d="M14 44 H106 V86 H14 Z" />
        <path d="M14 44 C14 19 106 19 106 44 Z" />
      </g>
      {/* lid / body seam */}
      <rect x="14" y="50" width="92" height="4" fill={PAPER} />
      {/* iron banding straps */}
      <g fill={PAPER} opacity="0.85">
        <rect x="28" y="29" width="4" height="57" />
        <rect x="88" y="29" width="4" height="57" />
      </g>
      {/* plank seams on the body */}
      <g stroke={PAPER} strokeWidth="1.2" opacity="0.3">
        <path d="M14 67 H106 M14 78 H106" />
      </g>
      {/* lock plate + keyhole (the one coral mark) */}
      <rect x="52" y="49" width="16" height="17" rx="2" fill={CORAL} />
      <circle cx="60" cy="55" r="2.2" fill={INK} />
      <path d="M60 56 L58 61 H62 Z" fill={INK} />
    </svg>
  );
}

/* ── Distant seaplane ── */
export function Seaplane(props: Illo) {
  return (
    <svg viewBox="0 0 100 50" {...base(props)}>
      <g fill={INK}>
        <path d="M20 26 C40 22 70 22 88 26 C70 30 40 30 20 26 Z" />
        <path d="M40 18 H62 L56 26 H46 Z" />
        <path d="M44 26 L40 38 H48 L52 28 Z M56 26 L60 38 H52 L52 28 Z" />
        <path d="M36 40 H64 V43 H36 Z" />
        <path d="M84 22 L96 18 L92 26 Z" />
      </g>
    </svg>
  );
}
