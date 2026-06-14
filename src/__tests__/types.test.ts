import { describe, expect, it } from 'vitest';
import { pullAge, newestPull, isThisTide } from '@/lib/types';

// Fixed reference time so pullAge tests never depend on the real clock.
const NOW = new Date('2026-06-08T12:00:00Z');

function isoMinutesBefore(base: Date, minutes: number): string {
  return new Date(base.getTime() - minutes * 60_000).toISOString();
}

describe('pullAge', () => {
  it('returns "pulled <1h ago" for a scrape under an hour old', () => {
    expect(pullAge(isoMinutesBefore(NOW, 30), NOW)).toBe('pulled <1h ago');
  });

  it('returns whole hours for a scrape within the day', () => {
    expect(pullAge(isoMinutesBefore(NOW, 120), NOW)).toBe('pulled 2h ago');
  });

  it('returns whole days for an older scrape', () => {
    expect(pullAge(isoMinutesBefore(NOW, 3 * 24 * 60), NOW)).toBe('pulled 3d ago');
  });

  it('returns an empty string for an invalid date', () => {
    expect(pullAge('not-a-date', NOW)).toBe('');
  });
});

describe('newestPull', () => {
  it('picks the maximum epoch ms across the array', () => {
    const oldest = '2026-06-01T00:00:00Z';
    const newest = '2026-06-08T00:00:00Z';
    expect(newestPull([oldest, newest, '2026-06-05T00:00:00Z'])).toBe(
      new Date(newest).getTime(),
    );
  });

  it('ignores invalid entries', () => {
    const valid = '2026-06-08T00:00:00Z';
    expect(newestPull(['nope', valid, 'also-bad'])).toBe(new Date(valid).getTime());
  });

  it('returns 0 for an empty array', () => {
    expect(newestPull([])).toBe(0);
  });
});

describe('isThisTide', () => {
  const newestMs = new Date('2026-06-08T12:00:00Z').getTime();

  it('returns true for a listing within the 1h window', () => {
    const within = new Date(newestMs - 30 * 60_000).toISOString();
    expect(isThisTide(within, newestMs)).toBe(true);
  });

  it('returns false for a listing just outside the window (61 min older)', () => {
    const outside = new Date(newestMs - 61 * 60_000).toISOString();
    expect(isThisTide(outside, newestMs)).toBe(false);
  });

  it('returns true at the exact 1h boundary', () => {
    const boundary = new Date(newestMs - 3_600_000).toISOString();
    expect(isThisTide(boundary, newestMs)).toBe(true);
  });

  it('returns false for an invalid date', () => {
    expect(isThisTide('not-a-date', newestMs)).toBe(false);
  });
});
