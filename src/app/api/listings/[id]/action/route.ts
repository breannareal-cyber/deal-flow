import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import type { Stage } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID: Stage[] = ['new', 'researching', 'contacted', 'passed', 'dead'];

// Move a candidate to a pipeline stage (the canonical disposition action).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { stage?: string };
  const stage = body.stage as Stage | undefined;
  if (!stage || !VALID.includes(stage)) {
    return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
  }
  await getStorage().setStage(id, stage);
  return NextResponse.json({ ok: true });
}
