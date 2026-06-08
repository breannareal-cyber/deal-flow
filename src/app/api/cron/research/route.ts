import { NextResponse } from 'next/server';
import { isAuthorized } from '@/lib/auth';
import { runResearch } from '@/lib/pipeline';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const result = await runResearch();
  return NextResponse.json(result);
}
