---
title: "IntersectionObserver scroll-reveal leaves above-the-fold content blank until JS hydrates"
date: 2026-06-08
tags: [ui, performance, react, nextjs]
category: gotcha
module: ui
symptoms:
  - "hero / page header renders blank on first load, content appears a beat later"
  - "screenshots taken right after navigation show empty hero"
  - "content opacity:0 until JS runs"
---

# Scroll-reveal blanks above-the-fold content until JS hydrates

## Problem
A `Reveal` wrapper (sets `opacity:0` + translate, then fades in when an IntersectionObserver fires)
was used on hero/header content. On first load the hero rendered **blank** and only appeared once
React hydrated and the observer callback ran — worst on a cold dev compile, but a real risk in
production on slow JS or if hydration fails. The content is server-rendered but visually hidden by CSS.

## Solution
**Only scroll-reveal content that is genuinely below the fold.** Render above-the-fold headers
directly (no `Reveal` wrapper) so they're visible at first paint regardless of JS. Keep `Reveal` for
feed cards / lower page sections that are actually off-screen at load.

```tsx
// Above the fold — render immediately, no reveal
<h1 className="display ...">Today’s Pipeline</h1>

// Below the fold — reveal on scroll is fine (and correct)
<Reveal delay={i * 50}><ListingCard ... /></Reveal>
```

This also aligns with the product-UI principle: tools should load into the task, not play an
orchestrated page-load animation.

## Why It Works
A reveal that hides content via CSS depends on client JS to un-hide it. For off-screen content that's
invisible anyway, that's free. For above-the-fold content it creates a flash-of-invisible-content
gated on hydration. Removing the wrapper there means the SSR'd markup is visible on first paint.

## Related
- Keep reveal transitions on `opacity`/`transform` only (GPU-friendly; never animate layout props).
- Honor `prefers-reduced-motion` (force `.reveal { opacity: 1 }`).
