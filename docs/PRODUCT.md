# DealFlow — Product Context

> Grounded in the codebase (`src/lib/scoring/*`, `src/components/feed/zone-modal.tsx`,
> `src/lib/types.ts`, the cron pipeline) and the design reference, not invented from a prompt.

**register: product**

## Product purpose

DealFlow is a personal **deal-sourcing pipeline** for an ETA (entrepreneurship-through-acquisition)
buyer. Every other day a pipeline scrapes business-for-sale listings (BizBuySell, Craigslist), scores
each against a fixed **buy box**, runs light web research, and surfaces a short, ranked daily feed. It
exists to turn the firehose of for-sale listings into a handful of decisions: pursue, dig deeper, or pass.

It is a tool the owner opens with morning coffee, not a marketing site. Speed-to-judgment and trust in
the scoring are everything. The feed should feel like a captain reading the morning charts.

## The user

A single solo acquirer with a **dual technical + business** background, ~$150K cash to put down,
financing via SBA 7(a) + seller note, targeting Colorado / Mountain West (remote ownership possible).
Sharp, numerate, skeptical of hype. Reads the numbers first. Wants the system to be honest about gaps
(e.g. it openly flags the SBA equity-injection tension against the stated cash). One user, high trust,
high frequency. No onboarding hand-holding needed; respect their intelligence.

## The buy box (the thesis the UI organizes around)

Three feed **zones**, in priority order:
1. **Right in your criteria** — water / environmental / well / treatment sector + ~$300K–$1.5M EBITDA +
   financeable. The bullseye.
2. **Water match · outside spend** — genuine water-sector business, wrong size. Worth a glance.
3. **In spend · outside water** — enduring, recession-resistant non-water business (HVAC, pest control,
   document storage, niche distribution). A deliberate wildcard, capped at 3, quality-filtered hard.

Hard excludes: retail, restaurants, bars, gas stations, e-commerce, salons, consumer-fad franchises,
asset-only junk. The #1 risk the system guards against is **key-man dependency**.

## Brand & tone

- **Voice:** peer-level, dry, nautical-but-not-cheesy. "The catch," "the hold," "back to the hunt,"
  "charting the waters." Confident, never salesy, never cute for its own sake. A wink, not a costume.
- **Personality:** a vintage woodcut surf poster that happens to run a disciplined acquisition screen.
  Editorial and hand-made, not corporate-fintech.
- **Trust signals:** show the gaps, cap the wildcards, name the deal-killers. Honesty is the brand.

## Anti-references (do NOT look like these)

- Navy-and-gold fintech / Bloomberg-terminal finance UI.
- Generic SaaS dashboard: white cards, blue primary button, hero-metric tiles, icon grids.
- Crypto neon-on-black.
- "Dark mode because tools look cool dark." This product lives in **overcast daylight** (slate sky),
  with ink reserved for dense data and the ground band. See DESIGN.md.

## Strategic principles

1. **Judgment over volume.** A short ranked feed beats an exhaustive table. Three zones, capped wildcard.
2. **Numbers are first-class.** EBITDA, ask, age, multiples read like a ledger (mono figures, aligned).
3. **Earn trust by showing the seams.** Surface deal-killers and financing tensions, don't hide them.
4. **Personality serves focus.** The woodcut world is the wrapper; the data is the point. Ration the
   coral, keep motion restrained, never let decoration slow the morning read.
