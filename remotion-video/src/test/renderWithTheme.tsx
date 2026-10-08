// src/test/renderWithTheme.tsx
// Helper for unit tests rendering components wrapped in ThemeProvider

import React from 'react';
import { renderToString } from 'react-dom/server';
import { ThemeProvider } from '../theme/ThemeProvider';
import { Brand } from '../schema/brand';
import brandJson from '../../../brands/bharatqr/brand.json';

export const testBrand = Brand.parse(brandJson);

export function renderWithTheme(
  ui: React.ReactElement,
  options?: { brand?: typeof testBrand; locale?: 'en' | 'hi' | 'mr'; isDark?: boolean }
): string {
  return renderToString(
    <ThemeProvider
      brand={options?.brand ?? testBrand}
      locale={options?.locale ?? 'en'}
      isDark={options?.isDark ?? false}
    >
      {ui}
    </ThemeProvider>
  );
}
