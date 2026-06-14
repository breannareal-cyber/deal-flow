import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { runOffMarketScrape, backfillOffMarketEnrichment } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Scheduled off-market scrub (every other day via vercel.json cron). First backfills
// web enrichment onto already-stored candidates that predate it (so old name-only
// scores get the real website/blurb/sector signal), then surfaces N new Colorado
// water businesses. Auth-guarded like other crons.
export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const backfill = await backfillOffMarketEnrichment();
  const scrape = await runOffMarketScrape();
  return NextResponse.json({ backfill, scrape });
}
