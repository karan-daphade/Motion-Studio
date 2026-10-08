// src/engine/charts/__tests__/charts.test.ts
import { describe, it, expect } from 'vitest';
import { formatIndianNumber } from '../format';

describe('Charts & Indian Number Formatting (UI-05)', () => {
  it('formats 84200 as 84,200 per Indian numbering system', () => {
    expect(formatIndianNumber(84200)).toBe('84,200');
  });

  it('formats 125000 as 1,25,000 per Indian numbering system', () => {
    expect(formatIndianNumber(125000)).toBe('1,25,000');
  });

  it('prepends Rupee symbol when isCurrency is true', () => {
    expect(formatIndianNumber(84200, true)).toBe('₹84,200');
    expect(formatIndianNumber(125000, true)).toBe('₹1,25,000');
  });

  it('handles small and large values correctly', () => {
    expect(formatIndianNumber(500)).toBe('500');
    expect(formatIndianNumber(10000000)).toBe('1,00,00,000'); // 1 Crore
  });
});
