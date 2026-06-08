// Wayback Machine staleness probe. The "available" API returns the snapshot
// closest to a given timestamp; asking for a far-future timestamp yields the
// MOST RECENT snapshot — our proxy for "when was this site last meaningfully
// touched." A site last archived in 2014 is a strong coasting-toward-retirement
// signal. Degrades to null on any failure (never throws — enrichment is best-effort).

import { hostFromUrl } from './index';

type Fetcher = typeof fetch;

// "20140513120000" → "2014-05-13"
function tsToIsoDate(ts: string): string | null {
  const m = ts.match(/^(\d{4})(\d{2})(\d{2})/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

export async function waybackLastSnapshot(url: string, fetchFn: Fetcher = fetch): Promise<string | null> {
  try {
    const host = hostFromUrl(url);
    const res = await fetchFn(
      `https://archive.org/wayback/available?url=${encodeURIComponent(host)}&timestamp=29991231`
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      archived_snapshots?: { closest?: { timestamp?: string; available?: boolean } };
    };
    const ts = data.archived_snapshots?.closest?.timestamp;
    return ts ? tsToIsoDate(ts) : null;
  } catch {
    return null;
  }
}
