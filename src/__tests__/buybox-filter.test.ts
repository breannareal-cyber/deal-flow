import { describe, it, expect } from 'vitest';
import { matchesWaterFilter, inSpendRange, SPEND_MIN, SPEND_MAX } from '@/lib/config';

describe('matchesWaterFilter', () => {
  it('matches genuine water/environmental businesses', () => {
    expect(matchesWaterFilter('Water Well Drilling Company', null)).toBe(true);
    expect(matchesWaterFilter('Commercial & Residential Specialty Water Treatment', null)).toBe(true);
    expect(matchesWaterFilter('Home Based Septic Service', null)).toBe(true);
    expect(matchesWaterFilter('Reinke Irrigation Dealership', null)).toBe(true);
  });
  it('catches water relevance only present in the description', () => {
    expect(matchesWaterFilter('Meter Interface & Pulse Device Manufacturer', 'Makes water meters for municipal water utilities')).toBe(true);
  });
  it('does NOT match "well" inside "well-established" (word boundary)', () => {
    expect(matchesWaterFilter('Well-Established Dry Cleaner', 'A well-established business')).toBe(false);
  });
  it('does NOT match unrelated businesses', () => {
    expect(matchesWaterFilter('Turnkey Pizzeria & Bakery', 'Great food spot')).toBe(false);
    expect(matchesWaterFilter('Auto Repair Shop', 'Cars and trucks')).toBe(false);
  });
});

describe('inSpendRange', () => {
  it('uses the canonical buy box range $300K–$1.5M', () => {
    expect(SPEND_MIN).toBe(300_000);
    expect(SPEND_MAX).toBe(1_500_000);
  });
  it('accepts EBITDA in range', () => {
    expect(inSpendRange(350_000, null)).toBe(true);
    expect(inSpendRange(1_500_000, null)).toBe(true);
  });
  it('falls back to cash flow when EBITDA absent', () => {
    expect(inSpendRange(null, 400_000)).toBe(true);
  });
  it('rejects out-of-range and undisclosed', () => {
    expect(inSpendRange(150_000, null)).toBe(false);
    expect(inSpendRange(3_000_000, null)).toBe(false);
    expect(inSpendRange(null, null)).toBe(false);
  });
});
