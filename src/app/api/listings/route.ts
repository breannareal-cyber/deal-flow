import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import { filterFeed } from '@/lib/feed-filter';

export const dynamic = 'force-dynamic';

// Feed with optional filters: ?type=off_market|listed · ?stage=<stage> · ?sector=<substr>.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const feed = await getStorage().getFeed();
  const listings = filterFeed(feed, {
    type: searchParams.get('type'),
    stage: searchParams.get('stage'),
    sector: searchParams.get('sector'),
  });
  return NextResponse.json({ listings });
}
