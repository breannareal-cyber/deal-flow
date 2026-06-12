import Anthropic from '@anthropic-ai/sdk';
import { sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { etaCases } from '@/db/schema';
import { config } from '@/lib/config';
import type { ETACaseData } from './types';
import type { StoredListing } from '@/lib/storage';

// Called by the pipeline cron after scraping/scoring when the next case slot
// is a multiple of 10. Generates a full acquisition case from a real listing
// using Claude and inserts it into eta_cases.
export async function generatePipelineCase(listing: StoredListing): Promise<void> {
  if (!config.anthropic.apiKey) {
    console.warn('[eta] ANTHROPIC_API_KEY not set — skipping pipeline case generation');
    return;
  }

  // Determine the next case number to assign.
  const [{ maxCase }] = await db
    .select({ maxCase: sql<number>`coalesce(max(${etaCases.caseNumber}), 0)` })
    .from(etaCases);

  const nextNumber = maxCase + 1;

  // Only generate if this slot is a multiple of 10.
  if (nextNumber % 10 !== 0) return;

  const listingContext = [
    `Title: ${listing.title}`,
    `Location: ${listing.location ?? 'unknown'}`,
    `Sector: ${listing.sector ?? 'unknown'}`,
    listing.askingPrice != null ? `Asking price: $${(listing.askingPrice / 1000).toFixed(0)}K` : null,
    listing.revenue != null ? `Revenue: $${(listing.revenue / 1000).toFixed(0)}K` : null,
    listing.ebitda != null ? `EBITDA: $${(listing.ebitda / 1000).toFixed(0)}K` : null,
    listing.cashFlow != null ? `Cash flow (SDE): $${(listing.cashFlow / 1000).toFixed(0)}K` : null,
    listing.employees != null ? `Employees: ${listing.employees}` : null,
    listing.yearEstablished != null ? `Founded: ${listing.yearEstablished}` : null,
    listing.reasonForSelling ? `Reason for selling: ${listing.reasonForSelling}` : null,
    listing.description ? `\nDescription:\n${listing.description.slice(0, 800)}` : null,
  ].filter(Boolean).join('\n');

  const score = listing.score;
  const scoreContext = score
    ? `\nScoring verdict: ${score.verdict} (${score.zone})\nSummary: ${score.summary}`
    : '';

  const client = new Anthropic({ apiKey: config.anthropic.apiKey });

  const res = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 2500,
    system: `You are an ETA (Entrepreneurship Through Acquisition) master instructor creating acquisition case studies.
Given a real business listing, produce a structured training case. Return ONLY valid JSON with these fields:
{
  "company": "3-5 paragraph case presentation written in ETA investment memo style. Include the business description, financials (from provided data), deal structure if available, operations overview, and a clear multi-part evaluation prompt (A through F: Business Quality, Financial Quality, Seller Quality, Deal Quality, Operational Opportunity, Decision).",
  "expertAnswer": "Comprehensive investment committee review addressing each of A-F. Must include DSCR calculation if financials allow, multiple assessment, key risks quantified, and a clear decision with rationale. 600-900 words.",
  "teachingConcepts": ["4-6 specific ETA concepts this case teaches"],
  "keyRedFlags": ["3-6 specific red flags from this listing"],
  "keyGreenFlags": ["3-6 specific green flags from this listing"]
}
Write the case as if it were anonymized but realistic. Do not make up financial data — use only what is provided. If data is sparse, focus on what IS available and note the information gaps as part of the case.`,
    messages: [
      {
        role: 'user',
        content: `Create an ETA training case from this real listing:\n\n${listingContext}${scoreContext}`,
      },
    ],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[eta] Claude did not return valid JSON for pipeline case generation');
    return;
  }

  let parsed: ETACaseData;
  try {
    parsed = JSON.parse(jsonMatch[0]) as ETACaseData;
  } catch {
    console.error('[eta] Failed to parse Claude response as ETACaseData');
    return;
  }

  const difficulty = estimateDifficulty(listing);

  await db.insert(etaCases).values({
    caseNumber: nextNumber,
    title: listing.title,
    industry: listing.sector ?? 'General Services',
    difficulty,
    source: 'pipeline',
    listingId: listing.id,
    data: parsed,
  }).onConflictDoNothing();

  console.log(`[eta] Generated pipeline case #${nextNumber}: ${listing.title}`);
}

function estimateDifficulty(listing: StoredListing): number {
  let score = 1;
  if (listing.askingPrice != null && listing.askingPrice > 2_000_000) score++;
  if (listing.revenue != null && listing.ebitda != null) score++;
  if (listing.employees != null && listing.employees > 15) score++;
  if (listing.reasonForSelling) score++;
  return Math.min(score, 5);
}
