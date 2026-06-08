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
export function Medallion({ label = 'DEALFLOW', sub = 'OBX', ...props }: Illo & { label?: string; sub?: string }) {
  return (
    <svg viewBox="0 0 280 320" {...base(props)}>
      <defs>
        <clipPath id="porthole">
          <circle cx="140" cy="138" r="92" />
        </clipPath>
        <path id="arc" d="M 64 150 A 76 76 0 0 0 216 150" fill="none" />
      </defs>

      {/* curling tentacles emerging from behind the disc */}
      <g fill={INK}>
        {/* top-right, curling over the ring */}
        <path d="M196 70 C236 58 252 96 236 122 C228 136 214 138 210 128 C224 126 230 108 218 100 C206 92 192 104 196 118 C188 104 184 80 196 70 Z" />
        {/* bottom-left, hugging the disc edge then hooking out */}
        <path d="M92 206 C70 214 52 234 56 258 C58 274 78 280 86 268 C76 266 68 256 72 244 C77 230 96 226 104 216 C100 210 96 206 92 206 Z" />
        {/* bottom-right, hugging the disc edge then hooking out */}
        <path d="M190 208 C214 216 234 234 230 258 C228 274 208 280 200 268 C210 266 218 256 214 244 C209 230 190 226 182 216 C186 210 186 208 190 208 Z" />
      </g>
      {/* sucker dots along the tentacles */}
      <g fill={PAPER}>
        <circle cx="70" cy="250" r="2.2" /><circle cx="62" cy="236" r="1.8" />
        <circle cx="216" cy="250" r="2.2" /><circle cx="224" cy="236" r="1.8" />
        <circle cx="228" cy="98" r="2" /><circle cx="220" cy="112" r="1.8" />
      </g>

      {/* porthole scene */}
      <g clipPath="url(#porthole)">
        <rect x="44" y="40" width="192" height="200" fill={WASH} />
        {/* sea */}
        <rect x="44" y="140" width="192" height="100" fill={INK} />
        {/* rising sun + rays */}
        <circle cx="140" cy="104" r="22" fill={PAPER} />
        <g stroke={INK} strokeWidth="3" strokeLinecap="round">
          <path d="M140 60 V74 M140 134 V148 M96 104 H110 M170 104 H184 M110 74 L120 84 M170 74 L160 84 M110 134 L120 124 M170 134 L160 124" />
        </g>
        {/* horizon glints */}
        <g stroke={INK} strokeWidth="2.5" strokeLinecap="round" opacity="0.5">
          <path d="M70 128 H120 M150 128 H210 M84 136 H132 M158 136 H196" />
        </g>
        {/* cresting wave — ink mass with paper foam curls */}
        <path d="M44 240 V176 C72 170 92 196 116 190 C150 182 150 150 188 158 C214 163 224 184 236 178 V240 Z" fill={INK} />
        <g fill={PAPER}>
          <path d="M150 168 C156 158 172 156 180 162 C172 160 162 162 158 170 C166 166 176 168 180 174 C170 170 158 172 152 180 C156 172 152 168 150 168 Z" />
          <circle cx="120" cy="190" r="3" />
          <circle cx="98" cy="196" r="2.5" />
          <circle cx="170" cy="182" r="2.5" />
        </g>
        {/* foam streaks */}
        <g stroke={PAPER} strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <path d="M60 210 C90 202 110 214 140 208 C170 202 196 214 224 206" />
          <path d="M64 224 C96 218 116 228 146 222 C176 216 200 226 226 220" opacity="0.6" />
        </g>
      </g>

      {/* heavy ink ring */}
      <circle cx="140" cy="138" r="92" fill="none" stroke={INK} strokeWidth="10" />
      <circle cx="140" cy="138" r="99" fill="none" stroke={INK} strokeWidth="2" opacity="0.6" />

      {/* coral arched wordmark */}
      <text fill={CORAL} fontFamily="var(--font-archivo), sans-serif" fontWeight={900} letterSpacing="2">
        <textPath href="#arc" startOffset="50%" textAnchor="middle" style={{ fontSize: 34 }}>{label}</textPath>
      </text>
      <text x="140" y="206" fill={CORAL} textAnchor="middle" fontFamily="var(--font-archivo), sans-serif" fontWeight={700} fontSize="15" letterSpacing="6">{sub}</text>
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

/* ── Seagull silhouette (woodcut) ── */
export function Seagull(props: Illo) {
  return (
    <svg viewBox="0 0 140 90" {...base(props)}>
      <path fill={INK} d="M70 46 C56 24 36 16 12 14 C34 22 44 36 50 50 C40 46 30 48 24 56 C40 52 56 56 70 50 C84 56 100 52 116 56 C110 48 100 46 90 50 C96 36 106 22 128 14 C104 16 84 24 70 46 Z" />
      <path fill={INK} d="M70 46 C68 54 70 64 74 70 C70 64 66 54 70 46 Z" />
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

/* ── Kayaker silhouette ── */
export function Kayaker(props: Illo) {
  return (
    <svg viewBox="0 0 150 130" {...base(props)}>
      <g fill={INK}>
        {/* paddle */}
        <path d="M16 24 C20 18 30 18 34 26 L70 92 C73 98 68 104 62 100 L24 34 C20 28 14 30 16 24 Z" />
        <path d="M10 18 C8 10 22 8 26 16 C28 22 18 30 10 18 Z" />
        {/* body */}
        <path d="M66 56 C60 42 78 30 90 38 C100 44 98 58 88 62 C100 66 106 82 96 92 L66 100 C56 92 58 70 66 56 Z" />
        {/* kayak */}
        <path d="M40 104 C70 96 120 96 146 106 C120 116 70 116 40 108 C36 107 36 105 40 104 Z" />
      </g>
      <circle cx="86" cy="44" r="6" fill={PAPER} />
    </svg>
  );
}

/* ── Shark-suit SUP paddler (the Epicurrence character) ── */
export function SharkPaddler(props: Illo) {
  return (
    <svg viewBox="0 0 110 200" {...base(props)}>
      <g fill={INK}>
        {/* shark hood + body */}
        <path d="M48 18 C30 22 26 48 40 60 C34 92 38 132 46 150 L70 150 C78 130 80 92 74 60 C92 46 84 18 62 16 C66 26 64 36 56 38 C48 40 44 30 48 18 Z" />
        {/* dorsal fin */}
        <path d="M55 14 C58 4 70 6 70 16 C70 22 60 22 55 14 Z" />
        {/* legs */}
        <path d="M48 150 L44 192 L52 192 L57 156 Z" />
        <path d="M64 150 L70 192 L78 192 L72 156 Z" />
        {/* paddle */}
        <path d="M90 30 C94 24 102 28 100 36 L92 168 C90 176 82 174 84 166 Z" />
      </g>
      {/* shark mouth */}
      <path fill={PAPER} d="M44 44 C52 50 62 50 70 44 C64 56 50 56 44 44 Z" />
      <g fill={INK}>
        <path d="M46 46 L48 52 L50 46 M52 47 L54 53 L56 47 M58 47 L60 53 L62 47 M64 46 L66 52 L68 46" />
      </g>
      <circle cx="50" cy="34" r="3" fill={PAPER} />
      <circle cx="64" cy="34" r="3" fill={PAPER} />
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
      <g fill={INK}>
        <path d="M14 44 H106 V86 H14 Z" />
        <path d="M14 44 C14 20 106 20 106 44 Z" />
      </g>
      <rect x="14" y="54" width="92" height="5" fill={PAPER} />
      <g fill={PAPER}>
        <path d="M30 30 V44 H26 V31 Z M46 26 V44 H42 V26 Z M74 26 V44 H70 V26 Z M90 30 V44 H86 V31 Z" opacity="0.5" />
      </g>
      <rect x="52" y="50" width="16" height="18" rx="2" fill={CORAL} />
      <circle cx="60" cy="58" r="2.4" fill={INK} />
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
