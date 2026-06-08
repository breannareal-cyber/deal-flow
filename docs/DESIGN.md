# DealFlow — Design System

> **North star:** Epicurrence "OBX" — a vintage **woodcut / scratchboard** surf-counterculture
> poster, rendered as a product UI. Reference: `docs/design-reference/epicurrence-hero.png`.
> This file is the source of truth. When `impeccable` (or anyone) builds UI, it conforms to this.

DealFlow hunts the waters for businesses worth acquiring. The brand leans into that literally:
**deal-hunting as ocean expedition** — charts, tides, the catch, the hold. The visual language is
a hand-inked engraving washed in overcast daylight, with one warm coral spot color.

---

## 1. Art direction (read this first)

The single most important correction over a naive "dark mode + line icons" interpretation:

| ✗ Not this | ✓ This |
|---|---|
| Near-black `#0f0f0f` page background | **Mid-tone overcast slate** sky — the page reads in daylight |
| Thin 1px hairline SVG icons | **Heavy woodcut ink** — solid black masses, white scratch-highlights, dense hatching |
| Coral used everywhere as a UI accent | **One coral spot color**, rationed — hand-lettering & a few key marks only |
| Flat material-design surfaces | **Printed paper** feel — bone-cream highlights, ink black, subtle grain |
| Generic rounded cards | **Poster composition** — full-bleed illustration bands, a black "waterline" ground |

**Style keywords for any generated art / illustration:** woodcut, scratchboard, linocut,
pen-and-ink engraving, high-contrast black & cream, intricate cross-hatching, vintage surf poster,
single spot color. Think Stanley Donwood meets vintage National Park WPA prints.

---

## 2. Color tokens

Overcast-daylight palette. Background is a desaturated tidewater slate — **never** pure black except
for ink and the ground band.

```css
:root {
  /* Surfaces — overcast sky */
  --sky:        #8a9ba3;  /* primary page background (hero sky) */
  --sky-mist:   #a7b6bb;  /* lighter atmospheric haze / behind-subject wash */
  --sky-deep:   #6f828b;  /* slate shadow, dividers on light */
  --paper:      #f0ebe1;  /* bone / cream — clouds, highlights, "paper" cards */

  /* Ink — the woodcut black */
  --ink:        #0e1011;  /* primary ink: illustration, ground band, footer, text-on-light */
  --ink-soft:   #1c2024;  /* raised ink surfaces (cards on the ground band) */
  --ink-line:   #2b3137;  /* hairlines/borders on ink surfaces */

  /* Spot color — ration it */
  --coral:      #df7d62;  /* THE accent: hand-lettering, primary verdict, 1 mark per view */
  --coral-deep: #c4634b;  /* coral pressed/hover */

  /* Text */
  --on-sky:     #14181b;  /* ink text on slate/paper */
  --on-sky-mut: #45525a;  /* muted text on slate */
  --on-ink:     #ece7dd;  /* cream text on ink */
  --on-ink-mut: #8b949b;  /* muted text on ink */

  /* Functional verdict hues (kept woodcut-muted, not neon) */
  --pursue:     #df7d62;  /* coral — bullseye */
  --dig:        #d4a24a;  /* ochre */
  --edge:       #6f9aa8;  /* faded teal */
  --pass:       #5a646b;  /* slate-gray */
}
```

**Contrast rules**
- On `--sky`: use `--ink` / `--on-sky` for text. Coral on slate passes for large/bold only — never coral body text.
- The black **ground band** (`--ink`) is where dense data lives (feeds, tables, cards). Sky is for hero, headers, breathing room.
- Coral appears **at most once or twice per viewport**. If everything is coral, nothing is.

---

## 3. Typography

Two voices: a clean structural grotesque for the system, and an optional groovy display face for
hero-only personality (mirrors the psychedelic "EPICURRENCE OBX" hand-lettering).

```css
--font-display: "Archivo", "Inter Tight", system-ui, sans-serif; /* wordmark, H1 — heavy, tight */
--font-sans:    "Inter", system-ui, sans-serif;                  /* body, UI */
--font-mono:    "Geist Mono", ui-monospace, monospace;           /* figures: $, EBITDA, dates */
```

> Epicurrence ships in **Suisse Intl** (proprietary). Closest free stand-ins: **Inter Tight** /
> **Archivo** for display, **Inter** for body. If a Suisse license exists, swap `--font-display`/`--font-sans` only.

**Treatment**
- **Wordmark / H1:** uppercase, weight 800, letter-spacing `-0.03em`, line-height `0.92`. Big and confident.
- **Eyebrows / labels / nav / buttons:** uppercase, weight 600, letter-spacing `0.18em`, small (11–12px).
- **Body:** sentence case, weight 400, line-height 1.6, max-width ~62ch.
- **Figures** ($ amounts, EBITDA, dates): `--font-mono` so columns align and numbers feel like ledger entries.

**Scale** (clamped, fluid): H1 `clamp(2.5rem, 6vw, 4.5rem)` · H2 `1.875rem` · H3 `1.25rem` ·
body `0.9375rem` · label `0.6875rem`.

---

## 4. Layout & composition

- **Poster hero:** full-bleed `--sky` band. Wordmark top-left, primary CTA top-right (solid black rect).
  A woodcut illustration anchors the center; a black **ground/waterline** caps the bottom of the band.
- **Ground band:** sections that hold data sit on `--ink`. The transition sky→ink is the "waterline" —
  use a torn/hand-inked edge (irregular SVG path), not a straight rule.
- **Container:** content max-width `42rem` (reading) / `72rem` (feed grid). Generous vertical rhythm (`py-16`+).
- **Clouds & sea life** are decorative layers placed absolutely, low-priority, `pointer-events-none`.

---

## 5. Components

**Buttons**
- *Primary:* solid `--ink` rectangle (radius 2px, near-square), `--paper` uppercase wide-tracked label.
  On coral-moment views, primary may be `--coral` with `--ink` text. Hover: lift 1px + `--coral-deep`.
- *Secondary:* outline — 1.5px `--ink` border on sky, transparent fill, ink label.
- *Ghost / nav:* uppercase wide-tracked label, no chrome, opacity hover.

**Cards (the catch)**
- Live on the ground band: `--ink-soft` fill, `1px --ink-line` border, radius 2–4px.
- A coral hairline at top that lights up on hover; lift `-2px` + soft coral-tinted shadow.
- Header row: verdict tag (coral dot + label) left, location right. Mono figures in a 3-col stat row.
- Woodcut motif (small engraving) may sit as a faint watermark behind the card header.

**Verdict tags:** `● LABEL` — filled dot in the verdict hue + uppercase wide-tracked label. No pills.

**Clouds / illustrations:** flat `--paper` cloud shapes; black scratchboard creatures. Never gradients.

---

## 6. Motion (restrained — it's a print that breathes)

- Clouds **drift** slowly (15–25s), sea life **bobs** (6–8s) — ambient, subtle, `prefers-reduced-motion` off.
- Content **scroll-reveals** with a short fade + 20px lift, eased `cubic-bezier(0.16,1,0.3,1)`.
- Optional **parallax**: illustration layers move at 0.9× scroll. Keep it gentle.
- No spinners-as-decoration, no bouncy easing, no neon glows. Ink doesn't glow.

---

## 7. Accessibility

- Body text always ink-on-light or cream-on-ink at ≥ 4.5:1. Coral is large/bold only.
- All ambient art is `aria-hidden` + `pointer-events-none`.
- Honor `prefers-reduced-motion`: kill drift/bob/parallax, keep instant reveals.
- Focus states: 2px `--coral` outline offset 2px — visible on both sky and ink.

---

## 8. Current implementation gap (to fix when building)

The first redesign pass (`redesign-epicurrence` branch) interpreted this as **near-black + thin line
icons** — wrong. To reach the reference:

1. **Repaint the background** from `#0b0c0e` to the overcast **`--sky` `#8a9ba3`**; reserve ink for
   the ground band, footer, and data cards.
2. **Replace thin `.ink` SVGs** with real **woodcut/scratchboard illustration** (heavy black fills +
   cream scratch-highlights). Commission/generate art in the style keywords above, or upgrade the
   existing SVGs to solid-fill engravings.
3. **Add the coral hand-lettering moment** (hero medallion) and ration coral elsewhere to 1–2 marks/view.
4. **Add flat cream clouds** and a **torn-ink waterline** between sky and ground sections.
5. Swap fonts to `--font-display` / `--font-sans` above.

Files in play: `src/app/globals.css` (tokens), `src/components/nautical/*` (illustrations + chrome),
`src/app/page.tsx`, `src/app/saved/page.tsx`, `src/app/listings/[id]/page.tsx`, feed components.
All data/scraping/scoring wiring stays untouched.
