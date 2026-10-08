// src/theme/contrast.ts
// WCAG 2.1 Contrast & Relative Luminance Helper (DS-04)

export function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace(/^#/, '');
  let r = 0;
  let g = 0;
  let b = 0;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
  } else {
    throw new Error(`Invalid hex color: "${hex}"`);
  }

  return [r, g, b];
}

export function getRelativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);

  const [sR, sG, sB] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getRelativeLuminance(color1);
  const lum2 = getRelativeLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsContrast(
  textColor: string,
  backgroundColor: string,
  minContrast = 4.5
): boolean {
  const ratio = getContrastRatio(textColor, backgroundColor);
  return ratio >= minContrast;
}

export function getBestTextColor(
  backgroundColor: string,
  lightText = '#FFFFFF',
  darkText = '#0F172A'
): string {
  const lightContrast = getContrastRatio(lightText, backgroundColor);
  const darkContrast = getContrastRatio(darkText, backgroundColor);

  return lightContrast >= darkContrast ? lightText : darkText;
}
