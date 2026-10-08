// src/components/clones/TableQrScan/TableQrScan.test.tsx
import { describe, it, expect } from 'vitest';
import { TableQrScan } from './TableQrScan';
import { MOCK_TABLE_QR_SCANS } from '../../../catalog/mock/customerJourney';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('TableQrScan UI Clone (frontend/components/waitlist/table-qr-scan-client.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <TableQrScan {...MOCK_TABLE_QR_SCANS.available} frame={frame} locale="en" />
      );
      expect(html).toContain('Table 4');
      expect(html).toContain('Swad Sagar Pure Veg');
      expect(html).toContain('Start Ordering');
    }
  });

  it('renders occupied state with active session guest details', () => {
    const html = renderWithTheme(
      <TableQrScan {...MOCK_TABLE_QR_SCANS.occupied} frame={20} locale="en" />
    );
    expect(html).toContain('Table Occupied');
    expect(html).toContain('Join Dining Session');
    expect(html).toContain('4 diners active');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <TableQrScan {...MOCK_TABLE_QR_SCANS.available} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('टेबल उपलब्ध है');

    const mrHtml = renderWithTheme(
      <TableQrScan {...MOCK_TABLE_QR_SCANS.available} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('टेबल उपलब्ध आहे');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <TableQrScan {...MOCK_TABLE_QR_SCANS.available} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
