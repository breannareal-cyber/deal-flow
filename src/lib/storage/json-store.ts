// Local JSON file storage — for the localhost demo. Persists to .data/listings.json.
// Simple, synchronous-feeling, good enough for one user reviewing ~15 deals/day.

import { promises as fs } from 'fs';
import path from 'path';
import type { ScoredListing, Score, Research, PipelineStatus, Stage } from '@/lib/types';
import { HIDDEN_STAGES } from '@/lib/types';
import { savedDeals } from '@/lib/feed-filter';
import type { StoredListing } from './index';

const DATA_DIR = path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'listings.json');

type DB = Record<string, StoredListing>;

async function read(): Promise<DB> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as DB;
  } catch {
    return {};
  }
}

async function write(db: DB): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export async function upsertListings(listings: ScoredListing[]): Promise<number> {
  const db = await read();
  let added = 0;
  for (const l of listings) {
    const key = `${l.source}:${l.externalId}`;
    if (!db[key]) added++;
    // Preserve existing score/research/stage on re-scrape; update listing fields
    const existing = db[key];
    db[key] = {
      ...l,
      score: existing?.score ?? l.score,
      research: existing?.research ?? l.research,
      stage: existing?.stage ?? 'new',
      starred: existing?.starred ?? false,
      pipelineStatus: existing?.pipelineStatus ?? l.pipelineStatus,
    };
  }
  await write(db);
  return added;
}

function keyFor(db: DB, id: string): string | undefined {
  return Object.keys(db).find((k) => db[k].id === id);
}

export async function getByStatus(status: PipelineStatus): Promise<ScoredListing[]> {
  const db = await read();
  return Object.values(db).filter((l) => l.pipelineStatus === status);
}

export async function saveScore(listingId: string, score: Score): Promise<void> {
  const db = await read();
  const key = keyFor(db, listingId);
  if (!key) return;
  db[key].score = score;
  await write(db);
}

export async function saveResearch(listingId: string, research: Research): Promise<void> {
  const db = await read();
  const key = keyFor(db, listingId);
  if (!key) return;
  db[key].research = research;
  await write(db);
}

export async function setStatus(listingId: string, status: PipelineStatus): Promise<void> {
  const db = await read();
  const key = keyFor(db, listingId);
  if (!key) return;
  db[key].pipelineStatus = status;
  await write(db);
}

// Record a failed stage attempt. Leaves the listing retryable ('scraped') until it
// has failed MAX_RETRIES times, then marks 'failed' so it stops consuming budget.
// Prevents a single transient Anthropic 429 / malformed-JSON from permanently
// burying a deal (it'll just retry on the next run).
const MAX_RETRIES = 3;
export async function recordFailure(listingId: string): Promise<void> {
  const db = await read();
  const key = keyFor(db, listingId);
  if (!key) return;
  const n = (db[key].retryCount ?? 0) + 1;
  db[key].retryCount = n;
  db[key].pipelineStatus = n >= MAX_RETRIES ? 'failed' : 'scraped';
  await write(db);
}

export async function getFeed(): Promise<StoredListing[]> {
  const db = await read();
  return Object.values(db)
    .filter((l) => !HIDDEN_STAGES.includes(l.stage ?? 'new') && !l.duplicateOf)
    .sort((a, b) => (b.scrapedAt > a.scrapedAt ? 1 : -1));
}

export async function getSaved(): Promise<StoredListing[]> {
  const db = await read();
  return savedDeals(Object.values(db).filter((l) => !l.duplicateOf));
}

export async function getById(id: string): Promise<StoredListing | null> {
  const db = await read();
  const key = keyFor(db, id);
  return key ? db[key] : null;
}

export async function getExistingIds(prefix?: string): Promise<Set<string>> {
  const db = await read();
  const ids = Object.values(db)
    .map((l) => l.id)
    .filter((id) => (prefix ? id.startsWith(prefix) : true));
  return new Set(ids);
}

export async function setStage(id: string, stage: Stage): Promise<void> {
  const db = await read();
  const key = keyFor(db, id);
  if (!key) return;
  db[key].stage = stage;
  await write(db);
}

export async function setStar(id: string, starred: boolean): Promise<void> {
  const db = await read();
  const key = keyFor(db, id);
  if (!key) return;
  db[key].starred = starred;
  await write(db);
}

export async function count(): Promise<number> {
  const db = await read();
  return Object.keys(db).length;
}
