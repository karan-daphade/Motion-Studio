
import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { Brand } from '../../schema/brand';
import brandJson from '../../../../brands/bharatqr/brand.json';

const validBrand = Brand.parse(brandJson);

const TestConsumer: React.FC = () => {
  const { colors, locale, fontFamily } = useTheme();
  return (
    <div data-testid="theme-test" style={{ color: colors.primary, fontFamily }}>
      <span>{locale}</span>
    </div>
  );
};

describe('ThemeProvider (BRD-10, DS-03, DS-04)', () => {
  it('provides theme context to consumers', () => {
    const html = renderToString(
      <ThemeProvider brand={validBrand} locale="en">
        <TestConsumer />
      </ThemeProvider>
    );
    expect(html).toContain('<span>en</span>');
    expect(html).toContain(validBrand.colors.primary);
  });

  it('sets Indic font family when locale is hi or mr', () => {
    const html = renderToString(
      <ThemeProvider brand={validBrand} locale="mr">
        <TestConsumer />
      </ThemeProvider>
    );
    expect(html).toContain('<span>mr</span>');
    expect(html).toContain('Noto Sans Devanagari');
  });

  it('throws an error when useTheme is consumed without a Provider', () => {
    expect(() => renderToString(<TestConsumer />)).toThrow(
      'useTheme() must be used within a <ThemeProvider>.'
    );
  });
});
