// Domain-age probe via RDAP (the modern WHOIS). rdap.org bootstraps to the right
// registry. Registrant personal data is largely redacted post-GDPR, but the domain
// CREATION date is reliable and public — another business-age signal. Degrades to
// null on any failure (never throws — enrichment is best-effort).

import { hostFromUrl } from './index';

type Fetcher = typeof fetch;

type RdapEvent = { eventAction?: string; eventDate?: string };

export async function domainCreatedAt(url: string, fetchFn: Fetcher = fetch): Promise<string | null> {
  try {
    const host = hostFromUrl(url);
    const res = await fetchFn(`https://rdap.org/domain/${encodeURIComponent(host)}`);
    if (!res.ok) return null;
    const data = (await res.json()) as { events?: RdapEvent[] };
    const reg = (data.events ?? []).find((e) => e.eventAction === 'registration');
    if (!reg?.eventDate) return null;
    // "1998-07-02T00:00:00Z" → "1998-07-02"
    return reg.eventDate.slice(0, 10);
  } catch {
    return null;
  }
}
