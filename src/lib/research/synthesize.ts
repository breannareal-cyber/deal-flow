// Medium research: Tavily web search + Claude synthesis into owner profile,
// customer type, regulatory flags, working-capital indicators, and key risks.

import Anthropic from '@anthropic-ai/sdk';
import { config } from '@/lib/config';
import type { Listing, Research, WebFinding } from '@/lib/types';
import { tavilySearch } from './tavily';

export async function researchListing(listing: Listing): Promise<Research> {
  if (!config.anthropic.apiKey) throw new Error('ANTHROPIC_API_KEY not set — cannot synthesize');

  // Structured queries (not generic — avoids unrelated same-name results)
  const queries = [
    `"${listing.title}" ${listing.location ?? ''} acquisition`,
    `${listing.brokerName ?? listing.title} owner ${listing.location ?? ''}`,
    `"${listing.title}" license permit ${listing.state ?? 'Colorado'}`,
  ];

  const findingsArrays = await Promise.all(queries.map((q) => tavilySearch(q, 3)));
  const webFindings: WebFinding[] = dedupeByUrl(findingsArrays.flat()).slice(0, 8);

  const client = new Anthropic({ apiKey: config.anthropic.apiKey });
  const res = await client.messages.create({
    model: config.anthropic.model,
    max_tokens: 1000,
    system: `You synthesize web research for an ETA buyer evaluating a water/environmental business. Produce a concise, practitioner-grade brief. Cover: what the business does + likely customer type (municipal/residential/commercial), owner tenure/succession signal, regulatory standing (licenses transferable?), and working-capital indicators. Flag red and green signals. Return ONLY JSON:
{"summary": "1 paragraph", "ownerInfo": "1-2 sentences on owner/tenure/motivation", "keyRisks": ["3-5 specific risks"]}`,
    messages: [
      {
        role: 'user',
        content:
          `Listing: ${listing.title} (${listing.location}), ${listing.sector}\n` +
          `Reason for selling: ${listing.reasonForSelling ?? 'unknown'}\n\n` +
          `Web findings:\n${webFindings.map((f) => `- ${f.title}: ${f.snippet}`).join('\n') || '(none found)'}`,
      },
    ],
  });

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  let parsed: Record<string, unknown> = {};
  if (jsonMatch) {
    try { parsed = JSON.parse(jsonMatch[0]); } catch { parsed = {}; } // soft-fail: empty research, not a crash
  }

  return {
    depth: 'medium',
    summary: String(parsed.summary ?? ''),
    webFindings,
    ownerInfo: String(parsed.ownerInfo ?? ''),
    keyRisks: Array.isArray(parsed.keyRisks) ? parsed.keyRisks : [],
  };
}

function dedupeByUrl(findings: WebFinding[]): WebFinding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    if (seen.has(f.url)) return false;
    seen.add(f.url);
    return true;
  });
}
