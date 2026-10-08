// src/components/clones/TableCard/TableCard.test.tsx
import { describe, it, expect } from 'vitest';
import { TableCard } from './TableCard';
import { MOCK_TABLE_CARDS } from '../../../catalog/mock/customerJourney';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('TableCard UI Clone (frontend/components/operations/TableCard.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <TableCard {...MOCK_TABLE_CARDS.occupied} frame={frame} locale="en" />
      );
      expect(html).toContain('T7');
      expect(html).toContain('2,450');
    }
  });

  it('renders assigned state with customer token', () => {
    const html = renderWithTheme(
      <TableCard {...MOCK_TABLE_CARDS.assigned} frame={15} locale="en" />
    );
    expect(html).toContain('WL-08');
    expect(html).toContain('Aarav Deshmukh');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <TableCard {...MOCK_TABLE_CARDS.vacant} frame={0} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('खाली');

    const mrHtml = renderWithTheme(
      <TableCard {...MOCK_TABLE_CARDS.vacant} frame={0} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('रिक्त');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <TableCard {...MOCK_TABLE_CARDS.occupied} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
