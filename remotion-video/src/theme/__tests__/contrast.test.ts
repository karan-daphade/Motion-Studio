// src/theme/__tests__/contrast.test.ts
import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  meetsContrast,
  getBestTextColor,
} from '../contrast';

describe('WCAG 2.1 Contrast Helper (DS-04)', () => {
  it('parses 3-character and 6-character hex colors correctly', () => {
    expect(hexToRgb('#FFF')).toEqual([255, 255, 255]);
    expect(hexToRgb('#000')).toEqual([0, 0, 0]);
    expect(hexToRgb('#E8590C')).toEqual([232, 89, 12]);
  });

  it('calculates relative luminance according to sRGB standards', () => {
    expect(getRelativeLuminance('#FFFFFF')).toBeCloseTo(1.0, 3);
    expect(getRelativeLuminance('#000000')).toBeCloseTo(0.0, 3);
  });

  it('calculates correct contrast ratio between black and white', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21.0, 1);
  });

  it('correctly assesses compliance against contrast threshold', () => {
    // Pure black on pure white passes 4.5:1
    expect(meetsContrast('#000000', '#FFFFFF', 4.5)).toBe(true);
    // Pure white on dark slate navy (#0F172A)
    expect(meetsContrast('#FFFFFF', '#0F172A', 4.5)).toBe(true);
    // Light gray on pure white should fail 4.5:1
    expect(meetsContrast('#CCCCCC', '#FFFFFF', 4.5)).toBe(false);
  });

  it('selects best text color between light and dark options', () => {
    // On dark background (#0F172A), should select white text
    expect(getBestTextColor('#0F172A')).toBe('#FFFFFF');
    // On light background (#F8FAFC), should select dark text
    expect(getBestTextColor('#F8FAFC')).toBe('#0F172A');
  });
});
