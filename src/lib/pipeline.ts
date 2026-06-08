// Pipeline orchestrator: scrape → score → research. Each stage degrades gracefully
// if its credential is missing, and logs what it did. Batched to stay under timeouts.

import { capabilities, matchesWaterFilter } from './config';
import { scrapeAllSources, enabledSources } from './scrapers/sources';
import { scoreListing } from './scoring/score-listing';
import { researchListing } from './research/synthesize';
import { getStorage } from './storage';
import type { ScoredListing } from './types';

export type PipelineResult = {
  scraped: number;
  added: number;
  scored: number;
  researched: number;
  perSource: Record<string, number>;
  errors: string[];
  skipped: string[];
};

const SCORE_BATCH = Number(process.env.SCORE_BATCH ?? 15);
const RESEARCH_BATCH = 10;

// Scoring priority: water businesses first (Zones 1 & 2 — the bullseye), then
// in-spend non-water (Zone 3 candidates), then Craigslist noise last.
function scorePriority(l: { source: string; title: string; description: string | null }): number {
  if (l.source === 'bizbuysell' && matchesWaterFilter(l.title, l.description)) return 0;
  if (l.source === 'bizbuysell') return 1;
  return 2;
}

export async function runScrape(): Promise<{
  scraped: number;
  added: number;
  perSource: Record<string, number>;
  errors: string[];
}> {
  // Pull from every enabled source (Craigslist always; BizBuySell when APIFY_TOKEN set).
  const { listings, perSource, errors } = await scrapeAllSources();
  const storage = getStorage();
  const scored: ScoredListing[] = listings.map((l) => ({ ...l, score: null, research: null }));
  const added = await storage.upsertListings(scored);
  return { scraped: listings.length, added, perSource, errors };
}

export async function runScore(): Promise<{ scored: number; errors: string[] }> {
  const errors: string[] = [];
  if (!capabilities.canScore()) return { scored: 0, errors: ['ANTHROPIC_API_KEY not set'] };

  const storage = getStorage();
  // Water businesses first, then Zone-3 candidates, then Craigslist noise.
  const pending = (await storage.getByStatus('scraped'))
    .sort((a, b) => scorePriority(a) - scorePriority(b))
    .slice(0, SCORE_BATCH);

  // Score the slow part (Claude calls) in parallel with a concurrency cap, but
  // PERSIST sequentially afterward — the JSON store does whole-file read-modify-
  // write, so concurrent writes would clobber each other. Parallel calls + serial
  // writes gives the ~5x speedup without the race.
  const concurrency = Number(process.env.SCORE_CONCURRENCY ?? 5);
  let scored = 0;
  for (let i = 0; i < pending.length; i += concurrency) {
    const batch = pending.slice(i, i + concurrency);
    const scoredBatch = await Promise.allSettled(batch.map((l) => scoreListing(l)));
    // Persist this batch's results serially before starting the next batch.
    for (let j = 0; j < scoredBatch.length; j++) {
      const r = scoredBatch[j];
      const listing = batch[j];
      if (r.status === 'fulfilled') {
        await storage.saveScore(listing.id, r.value);
        await storage.setStatus(listing.id, 'scored');
        scored++;
      } else {
        errors.push(`score ${listing.id}: ${r.reason?.message ?? r.reason}`);
        await storage.recordFailure(listing.id); // retryable until MAX_RETRIES
      }
    }
  }
  return { scored, errors };
}

export async function runResearch(): Promise<{ researched: number; errors: string[] }> {
  const errors: string[] = [];
  if (!capabilities.canResearch()) return { researched: 0, errors: ['TAVILY_API_KEY not set — research skipped'] };

  const storage = getStorage();
  const pending = (await storage.getByStatus('scored'))
    .filter((l) => l.score && l.score.verdict !== 'PASS')
    .slice(0, RESEARCH_BATCH);
  // Same pattern as scoring: parallel API calls (concurrency-capped), serial writes.
  const concurrency = Number(process.env.RESEARCH_CONCURRENCY ?? 5);
  let researched = 0;
  for (let i = 0; i < pending.length; i += concurrency) {
    const batch = pending.slice(i, i + concurrency);
    const done = await Promise.allSettled(batch.map((l) => researchListing(l)));
    for (let j = 0; j < done.length; j++) {
      const r = done[j];
      const listing = batch[j];
      if (r.status === 'fulfilled') {
        await storage.saveResearch(listing.id, r.value);
        await storage.setStatus(listing.id, 'researched');
        researched++;
      } else {
        errors.push(`research ${listing.id}: ${r.reason?.message ?? r.reason}`);
      }
    }
  }
  return { researched, errors };
}

// Full run for the manual trigger / demo: scrape, then score, then research, all at once.
export async function runFullPipeline(): Promise<PipelineResult> {
  const skipped: string[] = [];
  const errors: string[] = [];

  const scrape = await runScrape();
  errors.push(...scrape.errors);
  if (!capabilities.canScore()) skipped.push('scoring (no ANTHROPIC_API_KEY)');
  const score = await runScore();
  errors.push(...score.errors);
  if (!capabilities.canResearch()) skipped.push('research (no TAVILY_API_KEY)');
  const research = await runResearch();
  errors.push(...research.errors);

  return {
    scraped: scrape.scraped,
    added: scrape.added,
    scored: score.scored,
    researched: research.researched,
    perSource: scrape.perSource,
    errors,
    skipped,
  };
}

export function activeSources(): string[] {
  return enabledSources().map((s) => s.name);
}
