import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const storage = getStorage();
  const feed = await storage.getFeed();
  return NextResponse.json({ listings: feed });
}
