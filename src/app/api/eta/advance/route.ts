import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { etaCases, etaProgress } from '@/db/schema';

export const dynamic = 'force-dynamic';

// POST /api/eta/advance
// Increments currentCase to the next available case number, wrapping around.
export async function POST() {
  const [progress] = await db.select().from(etaProgress).where(eq(etaProgress.id, 1));
  if (!progress) {
    return NextResponse.json({ error: 'Progress not initialized — call GET /api/eta/case first' }, { status: 400 });
  }

  // Find the next case number greater than current; wrap to the lowest if none.
  const [next] = await db
    .select({ caseNumber: etaCases.caseNumber })
    .from(etaCases)
    .where(sql`${etaCases.caseNumber} > ${progress.currentCase}`)
    .orderBy(etaCases.caseNumber)
    .limit(1);

  let nextCase: number;
  if (next) {
    nextCase = next.caseNumber;
  } else {
    // Wrap: find the lowest case number.
    const [first] = await db
      .select({ caseNumber: etaCases.caseNumber })
      .from(etaCases)
      .orderBy(etaCases.caseNumber)
      .limit(1);
    nextCase = first?.caseNumber ?? 1;
  }

  await db
    .update(etaProgress)
    .set({ currentCase: nextCase, updatedAt: new Date() })
    .where(eq(etaProgress.id, 1));

  return NextResponse.json({ currentCase: nextCase });
}
