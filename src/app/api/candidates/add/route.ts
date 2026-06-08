import { NextResponse } from 'next/server';
import { addCandidateByUrl } from '@/lib/candidates/add';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // best-effort Wayback/WHOIS probes

// POST { url } → scored off-market candidate. Cheap (free enrichment + deterministic
// scoring), so it follows the public UI-action pattern rather than the paid-cron auth.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { url?: string };
  if (!body.url || typeof body.url !== 'string') {
    return NextResponse.json({ error: 'Enter a company website URL.' }, { status: 400 });
  }
  try {
    const result = await addCandidateByUrl(body.url);
    if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
    return NextResponse.json({ added: result.added, id: result.listing.id });
  } catch (e) {
    console.error('add candidate failed:', e);
    return NextResponse.json({ error: 'Could not add candidate.' }, { status: 500 });
  }
}
