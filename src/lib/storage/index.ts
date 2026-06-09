// Storage abstraction. If DATABASE_URL is set → Neon (Drizzle). Otherwise → local
// JSON file (works on localhost; Vercel's FS is read-only so production needs Neon).
// The pipeline calls this interface and never knows which backend is active.

import type { ScoredListing, Score, Research, PipelineStatus, Stage } from '@/lib/types';
import { capabilities } from '@/lib/config';
import * as jsonStore from './json-store';
import * as neonStore from './neon-store';

export type StoredListing = ScoredListing & {
  stage?: Stage;
  starred?: boolean; // favorite flag, orthogonal to stage
  retryCount?: number; // failed scoring/research attempts; retryable until MAX_RETRIES
};

export interface Storage {
  upsertListings(listings: ScoredListing[]): Promise<number>;
  getByStatus(status: PipelineStatus): Promise<ScoredListing[]>;
  saveScore(listingId: string, score: Score): Promise<void>;
  saveResearch(listingId: string, research: Research): Promise<void>;
  setStatus(listingId: string, status: PipelineStatus): Promise<void>;
  recordFailure(listingId: string): Promise<void>;
  getFeed(): Promise<StoredListing[]>;
  // Deals that belong in The Hold: starred OR marked Researched / Contacted / Pass.
  getSaved(): Promise<StoredListing[]>;
  getById(id: string): Promise<StoredListing | null>;
  // All ids ever stored (optionally filtered by id prefix, e.g. 'co-sos-'). Lets the
  // off-market source cap at N NEW per run and never re-surface a dismissed candidate.
  getExistingIds(prefix?: string): Promise<Set<string>>;
  setStage(id: string, stage: Stage): Promise<void>;
  setStar(id: string, starred: boolean): Promise<void>;
  count(): Promise<number>;
}

// One switch: DATABASE_URL set → Neon (production / Vercel's read-only FS); else
// the local JSON file (localhost demo). Both satisfy the Storage interface, so the
// pipeline and UI never know which is active.
export function getStorage(): Storage {
  return capabilities.usesDatabase() ? neonStore : jsonStore;
}
