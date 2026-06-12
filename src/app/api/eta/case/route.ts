import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { etaCases, etaProgress } from '@/db/schema';

export const dynamic = 'force-dynamic';

// GET /api/eta/case
// Returns the current case and the total case count.
// Creates the progress row (currentCase=1) on first call via upsert.
export async function GET() {
  // Upsert the progress singleton (id=1) — creates it on first request.
  await db.insert(etaProgress).values({ id: 1, currentCase: 1 }).onConflictDoNothing();

  const [progress] = await db.select().from(etaProgress).where(eq(etaProgress.id, 1));

  const [caseRow] = await db
    .select()
    .from(etaCases)
    .where(eq(etaCases.caseNumber, progress.currentCase));

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(etaCases);

  if (!caseRow) {
    return NextResponse.json({ error: 'No cases found' }, { status: 404 });
  }

  return NextResponse.json({
    currentCase: progress.currentCase,
    totalCases: count,
    case: {
      id: caseRow.id,
      caseNumber: caseRow.caseNumber,
      title: caseRow.title,
      industry: caseRow.industry,
      difficulty: caseRow.difficulty,
      source: caseRow.source,
      listingId: caseRow.listingId,
      data: caseRow.data,
    },
  });
}
