// Neon (Postgres) implementation of the Storage interface — the production backend.
// Selected by getStorage() when DATABASE_URL is set. Mirrors json-store's behavior
// exactly so the pipeline and UI are backend-agnostic.
//
// Design: full typed objects live in jsonb `data` columns; mutable fields are real
// columns. The read path overlays those columns over the jsonb snapshot (see
// rowToStoredListing). Writes use neon-http single statements (no multi-statement
// transactions needed).

import { eq, and, isNull, desc, like, notInArray, count as countRows } from 'drizzle-orm';
import { db } from '@/db/client';
import { listings, scores, research } from '@/db/schema';
import type { Listing, ScoredListing, Score, Research, PipelineStatus, Stage } from '@/lib/types';
import { HIDDEN_STAGES } from '@/lib/types';
import type { StoredListing } from './index';

// --- Row → domain mapping (pure, unit-tested) ---

export type JoinedRow = {
  listings: {
    id: string;
    source: string;
    externalId: string;
    pipelineStatus: PipelineStatus;
    scrapedAt: Date;
    duplicateOf: string | null;
    retryCount: number;
    stage: Stage;
    data: Listing;
  };
  scores: { listingId: string; verdict: Score['verdict']; data: Score; scoredAt: Date } | null;
  research: { listingId: string; depth: Research['depth']; data: Research; researchedAt: Date } | null;
};

// Reconstruct a StoredListing: spread the jsonb snapshot, then overlay the
// authoritative mutable columns (so a setStatus/setAction/recordFailure made after
// the snapshot is reflected), then attach score/research from their joined rows.
export function rowToStoredListing(row: JoinedRow): StoredListing {
  const l = row.listings;
  return {
    ...l.data,
    id: l.id,
    source: l.source,
    externalId: l.externalId,
    pipelineStatus: l.pipelineStatus,
    duplicateOf: l.duplicateOf,
    score: row.scores?.data ?? null,
    research: row.research?.data ?? null,
    stage: l.stage ?? 'new',
    retryCount: l.retryCount,
  };
}

// --- Query helpers ---

const joinAll = () =>
  db
    .select()
    .from(listings)
    .leftJoin(scores, eq(scores.listingId, listings.id))
    .leftJoin(research, eq(research.listingId, listings.id));

// --- Storage interface implementation ---

export async function upsertListings(incoming: ScoredListing[]): Promise<number> {
  if (incoming.length === 0) return 0;

  // Count how many are genuinely new (vs. re-scrapes) for the "added" return value.
  const existing = await db.select({ id: listings.id }).from(listings);
  const existingIds = new Set(existing.map((r) => r.id));
  let added = 0;

  for (const l of incoming) {
    if (!existingIds.has(l.id)) added++;
    // Store the listing portion only; score/research live in their own tables.
    const { score: _s, research: _r, ...listingData } = l;
    void _s;
    void _r;
    await db
      .insert(listings)
      .values({
        id: l.id,
        source: l.source,
        externalId: l.externalId,
        pipelineStatus: l.pipelineStatus,
        scrapedAt: new Date(l.scrapedAt),
        duplicateOf: l.duplicateOf,
        data: listingData,
      })
      .onConflictDoUpdate({
        target: listings.id,
        // Re-scrape refreshes listing fields but PRESERVES pipelineStatus,
        // retryCount, and stage (matches json-store semantics).
        set: { data: listingData, scrapedAt: new Date(l.scrapedAt) },
      });
  }
  return added;
}

export async function getByStatus(status: PipelineStatus): Promise<ScoredListing[]> {
  const rows = await joinAll().where(eq(listings.pipelineStatus, status));
  return (rows as JoinedRow[]).map(rowToStoredListing);
}

export async function saveScore(listingId: string, score: Score): Promise<void> {
  await db
    .insert(scores)
    .values({ listingId, verdict: score.verdict, data: score })
    .onConflictDoUpdate({
      target: scores.listingId,
      set: { verdict: score.verdict, data: score, scoredAt: new Date() },
    });
}

export async function saveResearch(listingId: string, r: Research): Promise<void> {
  await db
    .insert(research)
    .values({ listingId, depth: r.depth, data: r })
    .onConflictDoUpdate({
      target: [research.listingId, research.depth],
      set: { data: r, researchedAt: new Date() },
    });
}

export async function setStatus(listingId: string, status: PipelineStatus): Promise<void> {
  await db.update(listings).set({ pipelineStatus: status }).where(eq(listings.id, listingId));
}

// Retryable failure: keep 'scraped' until MAX_RETRIES, then 'failed' (matches
// json-store). Read-then-write — two round trips, fine on neon-http.
const MAX_RETRIES = 3;
export async function recordFailure(listingId: string): Promise<void> {
  const [cur] = await db
    .select({ retryCount: listings.retryCount })
    .from(listings)
    .where(eq(listings.id, listingId))
    .limit(1);
  if (!cur) return;
  const n = cur.retryCount + 1;
  await db
    .update(listings)
    .set({ retryCount: n, pipelineStatus: n >= MAX_RETRIES ? 'failed' : 'scraped' })
    .where(eq(listings.id, listingId));
}

export async function getFeed(): Promise<StoredListing[]> {
  const rows = await joinAll()
    .where(and(isNull(listings.duplicateOf), notInArray(listings.stage, HIDDEN_STAGES)))
    .orderBy(desc(listings.scrapedAt));
  return (rows as JoinedRow[]).map(rowToStoredListing);
}

export async function getById(id: string): Promise<StoredListing | null> {
  const rows = await joinAll().where(eq(listings.id, id)).limit(1);
  const row = (rows as JoinedRow[])[0];
  return row ? rowToStoredListing(row) : null;
}

export async function getExistingIds(prefix?: string): Promise<Set<string>> {
  const rows = prefix
    ? await db.select({ id: listings.id }).from(listings).where(like(listings.id, `${prefix}%`))
    : await db.select({ id: listings.id }).from(listings);
  return new Set(rows.map((r) => r.id));
}

export async function setStage(id: string, stage: Stage): Promise<void> {
  await db.update(listings).set({ stage }).where(eq(listings.id, id));
}

export async function count(): Promise<number> {
  const [row] = await db.select({ n: countRows() }).from(listings);
  return row?.n ?? 0;
}
