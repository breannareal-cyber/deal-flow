// Add-by-URL: turn a pasted company website into a scored off-market candidate.
// Pure orchestration with injectable boundaries (enrichment + storage) so it's
// unit-testable without network or filesystem. The route is a thin wrapper.

import { normalizeOffMarketUrl } from '@/lib/scrapers/normalize';
import { enrichOffMarket } from '@/lib/enrichment';
import { scoreOffMarket } from '@/lib/scoring/score-offmarket';
import { getStorage, type Storage } from '@/lib/storage';
import type { ScoredListing } from '@/lib/types';

export type AddResult =
  | { ok: true; added: boolean; listing: ScoredListing }
  | { ok: false; status: number; error: string };

export type AddDeps = {
  storage?: Storage;
  // Injectable enrichment (defaults to the real Wayback/WHOIS probes).
  enrich?: (l: ScoredListing) => Promise<ScoredListing>;
};

export async function addCandidateByUrl(url: string, deps: AddDeps = {}): Promise<AddResult> {
  const storage = deps.storage ?? getStorage();
  const enrich =
    deps.enrich ?? (async (l: ScoredListing) => ({ ...(await enrichOffMarket(l)), score: l.score, research: l.research }));

  const base = normalizeOffMarketUrl(url);
  if (!base) return { ok: false, status: 400, error: 'Enter a valid company website URL.' };

  // Idempotent: the registrable host is the id, so the same site returns the existing record.
  const existing = await storage.getById(base.id);
  if (existing) return { ok: true, added: false, listing: existing };

  const enriched = await enrich({ ...base, score: null, research: null });
  const score = scoreOffMarket(enriched);

  await storage.upsertListings([{ ...enriched, score: null, research: null }]);
  await storage.saveScore(enriched.id, score);
  await storage.setStatus(enriched.id, 'scored');

  return { ok: true, added: true, listing: { ...enriched, score, research: null } };
}
