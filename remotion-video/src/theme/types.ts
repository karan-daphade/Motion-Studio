// src/theme/types.ts
// Theme Types and Context Contracts (BRD-10, DS-03, DS-04)

import type { Brand } from '../schema/brand';
import type { LangType } from '../schema/catalog';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: {
    light: string;
    dark: string;
  };
  surface: string;
  surfaceMuted: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  status: {
    pending: string;
    preparing: string;
    ready: string;
    served: string;
    billed: string;
    cancelled: string;
  };
}

export interface ThemeTypography {
  latinFamily: string;
  devanagariFamily: string;
  scale: Record<string, number>;
  devanagariLineHeightMin: number;
}

export interface ThemeLayout {
  radii: {
    small: number;
    medium: number;
    large: number;
    full: string;
  };
  spacingUnit: number;
  shadows: string;
  borders: string;
  iconStyle: 'outline' | 'solid' | 'duotone' | 'custom';
}

export interface ThemeContextValue {
  brand: Brand;
  colors: ThemeColors;
  typography: ThemeTypography;
  layout: ThemeLayout;
  locale: LangType;
  isDark: boolean;
  getBestText: (bgHex: string) => string;
  fontFamily: string;
}
