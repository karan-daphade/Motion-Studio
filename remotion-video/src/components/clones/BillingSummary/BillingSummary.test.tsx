// src/components/clones/BillingSummary/BillingSummary.test.tsx
import { describe, it, expect } from 'vitest';
import { BillingSummary } from './BillingSummary';
import { MOCK_BILLS } from '../../../catalog/mock/operations';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('BillingSummary UI Clone (frontend/app/operations/billing/page.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <BillingSummary {...MOCK_BILLS.default} frame={frame} locale="en" />
      );
      expect(html).toContain('Table T3');
      expect(html).toContain('INV-2026-0842');
      expect(html).toContain('2,450');
    }
  });

  it('renders GST breakdown and tax invoice title', () => {
    const html = renderWithTheme(
      <BillingSummary {...MOCK_BILLS.default} frame={15} locale="en" />
    );
    expect(html).toContain('Tax Invoice');
    expect(html).toContain('CGST (2.5%)');
    expect(html).toContain('SGST (2.5%)');
    expect(html).toContain('58.33');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <BillingSummary {...MOCK_BILLS.default} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('टैक्स इनवॉइस');
    expect(hiHtml).toContain('कुल देय राशि');

    const mrHtml = renderWithTheme(
      <BillingSummary {...MOCK_BILLS.default} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('कर बीजक');
    expect(mrHtml).toContain('एकूण देय रक्कम');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <BillingSummary {...MOCK_BILLS.default} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
