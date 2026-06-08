import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { runFullPipeline } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Manual trigger: scrape → score → research in one shot. POST only — this spends
// real money (Apify + Anthropic), so it must not be GET-triggerable by a crawler,
// prefetch, or <img src>. Errors are logged server-side but returned generically.
export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const result = await runFullPipeline();
    return NextResponse.json(result);
  } catch (e) {
    console.error('manual scrape failed:', e);
    return NextResponse.json({ error: 'Pipeline run failed' }, { status: 500 });
  }
}
