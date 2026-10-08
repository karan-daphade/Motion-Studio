// src/components/clones/KdsCard/KdsCard.test.tsx
import { describe, it, expect } from 'vitest';
import { KdsCard } from './KdsCard';
import { MOCK_KDS_TICKETS } from '../../../catalog/mock/operations';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('KdsCard UI Clone (frontend/app/operations/kds/page.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <KdsCard {...MOCK_KDS_TICKETS.regular} frame={frame} locale="en" />
      );
      expect(html).toContain('KOT #42');
      expect(html).toContain('Paneer Butter Masala');
      expect(html).toContain('Bump Ticket');
    }
  });

  it('renders urgent state with fire indicator', () => {
    const html = renderWithTheme(
      <KdsCard {...MOCK_KDS_TICKETS.urgent} frame={10} locale="en" />
    );
    expect(html).toContain('URGENT');
    expect(html).toContain('14:40');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <KdsCard {...MOCK_KDS_TICKETS.regular} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('टिकट पूरा करें');

    const mrHtml = renderWithTheme(
      <KdsCard {...MOCK_KDS_TICKETS.regular} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('तिकीट पूर्ण करा');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <KdsCard {...MOCK_KDS_TICKETS.regular} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
