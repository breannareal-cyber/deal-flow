import { NextResponse } from 'next/server';
import { getStorage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

const VALID = ['pass', 'save', 'pursue'] as const;

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { action?: string };
  const action = body.action;
  if (!action || !VALID.includes(action as (typeof VALID)[number])) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  const storage = getStorage();
  await storage.setAction(id, action as (typeof VALID)[number]);
  return NextResponse.json({ ok: true });
}
