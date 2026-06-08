// Tavily web search client. Returns clean results for AI synthesis.

import { config } from '@/lib/config';
import type { WebFinding } from '@/lib/types';

export async function tavilySearch(query: string, maxResults = 5): Promise<WebFinding[]> {
  if (!config.tavily.apiKey) return [];

  const res = await fetch('https://api.tavily.com/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: config.tavily.apiKey,
      query,
      max_results: maxResults,
      search_depth: 'basic',
    }),
  });

  if (!res.ok) return [];
  const data = (await res.json()) as { results?: { title: string; url: string; content: string }[] };
  return (data.results ?? []).map((r) => ({
    title: r.title,
    url: r.url,
    snippet: r.content?.slice(0, 300) ?? '',
  }));
}
