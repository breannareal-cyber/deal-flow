import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { runFullPipeline } from '@/lib/pipeline';

// Single consolidated cron: scrape → score → research in one pass. Replaces the
// three staggered crons so the app stays within Vercel Hobby's 2-cron limit.
// Each stage is internally batched (SCORE_BATCH / RESEARCH_BATCH), so the full
// chain stays bounded under maxDuration. If Apify latency ever pushes a run past
// 300s, the fallback is Vercel Pro + the original staggered crons (those route
// files are kept).
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await runFullPipeline();
  return NextResponse.json(result);
}
