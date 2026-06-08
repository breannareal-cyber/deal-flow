---
title: "Scraping bot-protected marketplaces (BizBuySell/Akamai) via Apify residential proxy"
date: 2026-06-07
tags: [scraping, apify, anti-bot, integration]
category: integration
module: scrapers
symptoms: ["HTTP 403 Access Denied", "errors.edgesuite.net", "Powered and protected by ... Privacy", "Just a moment...", "Proxy responded with 407 Account is suspended"]
---

# Scraping bot-protected marketplaces via Apify

## Problem
Every business-for-sale marketplace is behind enterprise bot protection:
- **BizBuySell / BizQuest** → Akamai (`errors.edgesuite.net`, HTTP 403)
- **BusinessesForSale.com** → Cloudflare (`Just a moment...`)
- **DealStream, LoopNet** → 403 / Akamai

Direct `fetch`/curl gets 403 instantly (TLS/JA3 fingerprint). Even a **real automated Chrome** (CDP/DevTools) is held at the Akamai challenge — the automation itself is fingerprinted, independent of IP. You cannot beat this from your own infra without a full anti-detect stack (residential proxies + patched browser + TLS impersonation), which is a maintenance treadmill against an adaptive adversary.

## Solution
Don't fight the anti-bot layer — rent it. Use an **Apify actor** that already maintains the residential-proxy + anti-detect stack. For BizBuySell we use `shahidirfan/bizbuysell-scraper` (actor id `XynfRyQZTeRhNeYrF`), called via `run-sync-get-dataset-items`.

**Critical Apify account gotchas:**
1. **Residential proxy is gated on a free account.** Default groups are datacenter only (`BUYPROXIES94952`), which Akamai blocks. The actor needs `RESIDENTIAL` (priced $8/GB).
2. **Adding a card isn't enough** — new accounts get residential *suspended* (`407 Account is suspended`). An **inconsistent billing address** (e.g. country defaulted to "Czech Republic" with a US ZIP) keeps the fraud-hold active. Fixing the country to match the ZIP lifted the suspension.
3. Pass the proxy explicitly: `proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ['RESIDENTIAL'] }`.

**Actor quirks (shahidirfan):**
- Honors only ONE `startUrl` per run, and its keyword filter is broken (`?q=water` returns the general feed). **State-category URLs DO filter** (`/colorado-businesses-for-sale/`). So: scrape per state, filter to your niche in-code, let an LLM do semantic classification.
- Output uses snake_case (`price`, `cash_flow`, `ebitda`, `year_established`, `broker_name`, `real_estate_included_in_asking_price`) — 45 fields, financials populate only when the seller discloses.

## Why It Works
Apify's value is the continuously-maintained residential-proxy + browser-fingerprint layer. Renting it for ~$8/GB (a niche daily scrape is <$0.20) is far cheaper than maintaining homegrown anti-bot infra.

## Related
- [Apify run reliability](2026-06-07-apify-run-reliability.md) — runs are flaky; retry per state
- Cost: a niche CO+WY daily scrape ran ~$2/month against the $5 free credit
