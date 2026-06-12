import {
  pgTable,
  pgEnum,
  text,
  integer,
  serial,
  timestamp,
  jsonb,
  boolean,
  unique,
} from 'drizzle-orm/pg-core';
import type { Listing, Score, Research } from '@/lib/types';
import type { ETACaseData } from '@/lib/eta/types';

// Document-oriented schema. The app's domain types (Listing/Score/Research) are
// the source of truth — richer than any column set we'd hand-maintain — so each
// full object is stored as a jsonb `data` column. Only fields we QUERY, SORT, or
// CONSTRAIN are promoted to real columns:
//   - id: the app's own text id (`${source}-${externalId}`), NOT a random uuid —
//     the pipeline and UI route on this exact id.
//   - pipelineStatus / duplicateOf / retryCount / stage: MUTATED after scrape,
//     so they live in columns and the read mapper overlays them over the jsonb
//     snapshot (which may be stale).
//   - scrapedAt: feed sort key.
// This mirrors the JSON store's whole-object semantics and needs no migration when
// the types evolve.

export const pipelineStatusEnum = pgEnum('pipeline_status', [
  'scraped',
  'scored',
  'researched',
  'failed',
]);

export const verdictEnum = pgEnum('verdict_type', [
  'PURSUE',
  'DIG_DEEPER',
  'PASS',
  'EDGE_CASE',
]);

export const researchDepthEnum = pgEnum('research_depth', ['medium', 'deep']);

// Pipeline stage = the user's disposition of a candidate (ONE canonical field —
// replaces the old user_action pass/save/pursue, which overlapped confusingly).
export const stageEnum = pgEnum('pipeline_stage', [
  'new',
  'researching',
  'contacted',
  'passed',
  'dead',
]);

export const listings = pgTable('listings', {
  id: text('id').primaryKey(), // = `${source}-${externalId}`
  source: text('source').notNull(),
  externalId: text('external_id').notNull(),
  pipelineStatus: pipelineStatusEnum('pipeline_status').notNull().default('scraped'),
  scrapedAt: timestamp('scraped_at').notNull().defaultNow(),
  duplicateOf: text('duplicate_of'), // self-ref to listings.id; loose (no FK), matches JSON store
  retryCount: integer('retry_count').notNull().default(0),
  stage: stageEnum('stage').notNull().default('new'), // user disposition through the pipeline
  starred: boolean('starred').notNull().default(false), // favorite flag, orthogonal to stage
  data: jsonb('data').$type<Listing>().notNull(),
}, (t) => [
  unique().on(t.source, t.externalId),
]);

export const scores = pgTable('scores', {
  listingId: text('listing_id')
    .primaryKey()
    .references(() => listings.id, { onDelete: 'cascade' }),
  verdict: verdictEnum('verdict').notNull(),
  data: jsonb('data').$type<Score>().notNull(),
  scoredAt: timestamp('scored_at').notNull().defaultNow(),
});

export const research = pgTable('research', {
  listingId: text('listing_id')
    .notNull()
    .references(() => listings.id, { onDelete: 'cascade' }),
  depth: researchDepthEnum('depth').notNull(),
  data: jsonb('data').$type<Research>().notNull(),
  researchedAt: timestamp('researched_at').notNull().defaultNow(),
}, (t) => [
  unique().on(t.listingId, t.depth),
]);

// ETA (Entrepreneurship Through Acquisition) curriculum tables.
// Pre-built cases stored document-style — only case_number is queryable;
// all case content lives in jsonb data.

export const etaCases = pgTable('eta_cases', {
  id: serial('id').primaryKey(),
  caseNumber: integer('case_number').notNull().unique(),
  title: text('title').notNull(),
  industry: text('industry').notNull(),
  difficulty: integer('difficulty').notNull(), // 1–5
  source: text('source').notNull().default('curriculum'), // 'curriculum' | 'pipeline'
  listingId: text('listing_id').references(() => listings.id, { onDelete: 'set null' }),
  data: jsonb('data').$type<ETACaseData>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Single-row progress tracker (id always = 1).
export const etaProgress = pgTable('eta_progress', {
  id: integer('id').primaryKey().default(1),
  currentCase: integer('current_case').notNull().default(1),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
