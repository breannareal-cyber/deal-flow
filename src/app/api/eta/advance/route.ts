import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { etaCases, etaProgress } from '@/db/schema';

export const dynamic = 'force-dynamic';

// POST /api/eta/advance
// Moves to the next or previous case, wrapping at both ends.
// Body: { direction?: 'next' | 'prev' } — defaults to 'next'.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { direction?: string };
  const direction = body.direction === 'prev' ? 'prev' : 'next';

  const [progress] = await db.select().from(etaProgress).where(eq(etaProgress.id, 1));
  if (!progress) {
    return NextResponse.json({ error: 'Progress not initialized — call GET /api/eta/case first' }, { status: 400 });
  }

  let targetCase: number;

  if (direction === 'next') {
    const [next] = await db
      .select({ caseNumber: etaCases.caseNumber })
      .from(etaCases)
      .where(sql`${etaCases.caseNumber} > ${progress.currentCase}`)
      .orderBy(etaCases.caseNumber)
      .limit(1);

    if (next) {
      targetCase = next.caseNumber;
    } else {
      // Wrap to the lowest case.
      const [first] = await db
        .select({ caseNumber: etaCases.caseNumber })
        .from(etaCases)
        .orderBy(etaCases.caseNumber)
        .limit(1);
      targetCase = first?.caseNumber ?? 1;
    }
  } else {
    const [prev] = await db
      .select({ caseNumber: etaCases.caseNumber })
      .from(etaCases)
      .where(sql`${etaCases.caseNumber} < ${progress.currentCase}`)
      .orderBy(sql`${etaCases.caseNumber} desc`)
      .limit(1);

    if (prev) {
      targetCase = prev.caseNumber;
    } else {
      // Wrap to the highest case.
      const [last] = await db
        .select({ caseNumber: etaCases.caseNumber })
        .from(etaCases)
        .orderBy(sql`${etaCases.caseNumber} desc`)
        .limit(1);
      targetCase = last?.caseNumber ?? 1;
    }
  }

  await db
    .update(etaProgress)
    .set({ currentCase: targetCase, updatedAt: new Date() })
    .where(eq(etaProgress.id, 1));

  return NextResponse.json({ currentCase: targetCase });
}
