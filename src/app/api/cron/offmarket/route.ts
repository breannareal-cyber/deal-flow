import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { runOffMarketScrape } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Scheduled off-market scrub (every other day via vercel.json cron). Surfaces N new
// Colorado water businesses, enriches + scores them. Auth-guarded like other crons.
export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await runOffMarketScrape();
  return NextResponse.json(result);
}
