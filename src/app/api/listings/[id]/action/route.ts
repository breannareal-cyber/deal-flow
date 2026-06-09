import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';
import type { Stage } from '@/lib/types';

export const dynamic = 'force-dynamic';

const VALID: Stage[] = ['new', 'researching', 'contacted', 'passed', 'dead'];

// Mutate a candidate's disposition: a pipeline `stage` and/or the `starred` favorite
// flag (orthogonal). Accepts either or both in one request.
// Intentionally unauthenticated: this is a single-user tool (matches prior setStage behavior).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { stage?: string; starred?: boolean };
  const storage = getStorage();

  const hasStage = body.stage !== undefined;
  const hasStar = typeof body.starred === 'boolean';
  if (!hasStage && !hasStar) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  if (hasStage) {
    if (typeof body.stage !== 'string' || !VALID.includes(body.stage as Stage)) {
      return NextResponse.json({ error: 'Invalid stage' }, { status: 400 });
    }
    await storage.setStage(id, body.stage as Stage);
  }
  if (hasStar) {
    await storage.setStar(id, body.starred as boolean);
  }
  return NextResponse.json({ ok: true });
}
