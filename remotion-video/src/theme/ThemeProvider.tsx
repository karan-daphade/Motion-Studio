// src/theme/ThemeProvider.tsx
// Brand Theme Provider (BRD-10, DS-03, DS-04)

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { Brand } from '../schema/brand';
import type { LangType } from '../schema/catalog';
import { COLORS } from '../tokens/colors';
import { getBestTextColor, meetsContrast } from './contrast';
import { loadBrandFonts } from './fonts';
import type { ThemeContextValue, ThemeColors, ThemeTypography, ThemeLayout } from './types';

const ThemeContext = createContext<ThemeContextValue | null>(null);

export interface ThemeProviderProps {
  brand: Brand;
  locale?: LangType;
  isDark?: boolean;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  brand,
  locale = 'en',
  isDark = false,
  children,
}) => {
  useEffect(() => {
    void loadBrandFonts();
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const neutrals = brand.colors.neutrals || [];

    const colors: ThemeColors = {
      primary: brand.colors.primary,
      secondary: brand.colors.secondary || COLORS.secondary,
      accent: brand.colors.accent || COLORS.accentEmerald,
      background: {
        light: brand.colors.background.light,
        dark: brand.colors.background.dark,
      },
      surface: isDark ? brand.colors.background.dark : (neutrals[1] ?? COLORS.surfaceLight),
      surfaceMuted: neutrals[2] ?? COLORS.surfaceMuted,
      border: neutrals[3] ?? COLORS.borderLight,
      text: {
        primary: isDark ? COLORS.textInverse : (neutrals[4] ?? COLORS.textDark),
        secondary: isDark ? COLORS.textMuted : (neutrals[5] ?? COLORS.textSecondary),
        muted: isDark ? COLORS.textDim : (neutrals[6] ?? COLORS.textMuted),
        inverse: isDark ? COLORS.textDark : COLORS.textInverse,
      },
      status: {
        pending: brand.colors.semantic?.warning || COLORS.warning,
        preparing: brand.colors.semantic?.info || COLORS.info,
        ready: brand.colors.semantic?.success || COLORS.success,
        served: COLORS.purple,
        billed: COLORS.textDim,
        cancelled: brand.colors.semantic?.error || COLORS.danger,
      },
    };

    // Assert WCAG contrast compliance against colors.contrastMin (DS-04)
    const activeBg = isDark ? colors.background.dark : colors.background.light;
    const contrastMin = brand.colors.contrastMin || 4.5;
    if (!meetsContrast(colors.text.primary, activeBg, contrastMin)) {
      colors.text.primary = getBestTextColor(activeBg);
    }

    const typography: ThemeTypography = {
      latinFamily: 'Inter, system-ui, -apple-system, sans-serif',
      devanagariFamily: 'Noto Sans Devanagari, Mukta, sans-serif',
      scale: brand.typography.scale,
      devanagariLineHeightMin: brand.typography.devanagariLineHeightMin,
    };

    const layout: ThemeLayout = {
      radii: {
        small: brand.layout.radii.small,
        medium: brand.layout.radii.medium,
        large: brand.layout.radii.large,
        full: '9999px',
      },
      spacingUnit: brand.layout.spacingUnit,
      shadows: brand.layout.shadows,
      borders: brand.layout.borders,
      iconStyle: brand.layout.iconStyle,
    };

    const isIndic = locale === 'hi' || locale === 'mr';
    const activeFontFamily = isIndic
      ? `${typography.devanagariFamily}, ${typography.latinFamily}`
      : typography.latinFamily;

    return {
      brand,
      colors,
      typography,
      layout,
      locale,
      isDark,
      getBestText: (bgHex: string) => getBestTextColor(bgHex),
      fontFamily: activeFontFamily,
    };
  }, [brand, locale, isDark]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme() must be used within a <ThemeProvider>.');
  }
  return ctx;
}
