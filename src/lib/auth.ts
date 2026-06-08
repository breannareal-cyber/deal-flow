import { config } from './config';

// Guard cron + mutation routes. Vercel Cron sends Authorization: Bearer <CRON_SECRET>.
// Fails OPEN in local dev (no secret needed for the demo) but CLOSED in production —
// so a public Vercel deploy without CRON_SECRET can't have its paid scrape/score
// endpoints triggered anonymously (Apify + Anthropic spend).
export function isAuthorized(req: Request): boolean {
  if (!config.cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }
  return req.headers.get('authorization') === `Bearer ${config.cronSecret}`;
}
