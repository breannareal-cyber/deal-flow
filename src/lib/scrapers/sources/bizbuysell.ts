// BizBuySell source — wraps the Apify scraper. Only enabled when APIFY_TOKEN is set.

import { config } from '@/lib/config';
import { scrapeBizBuySell } from '../apify-bizbuysell';
import type { ScrapeSource } from './types';

export const bizBuySellSource: ScrapeSource = {
  name: 'bizbuysell',
  enabled: () => !!config.apify.token,
  scrape: scrapeBizBuySell,
};
