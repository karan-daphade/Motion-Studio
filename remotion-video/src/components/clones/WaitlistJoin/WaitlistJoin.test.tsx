// src/components/clones/WaitlistJoin/WaitlistJoin.test.tsx
import { describe, it, expect } from 'vitest';
import { WaitlistJoin } from './WaitlistJoin';
import { MOCK_WAITLIST_JOINS } from '../../../catalog/mock/customerJourney';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('WaitlistJoin UI Clone (frontend/components/waitlist/waitlist-join-client.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <WaitlistJoin {...MOCK_WAITLIST_JOINS.waiting} frame={frame} locale="en" />
      );
      expect(html).toContain('WL-14');
      expect(html).toContain('Vikram Malhotra');
      expect(html).toContain('#3');
    }
  });

  it('renders table assigned ready state with table prompt', () => {
    const html = renderWithTheme(
      <WaitlistJoin {...MOCK_WAITLIST_JOINS.tableAssigned} frame={15} locale="en" />
    );
    expect(html).toContain('Your Table is Ready!');
    expect(html).toContain('Table 3');
    expect(html).toContain('Proceed to Table');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <WaitlistJoin {...MOCK_WAITLIST_JOINS.waiting} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('डिजिटल कतार टिकट');

    const mrHtml = renderWithTheme(
      <WaitlistJoin {...MOCK_WAITLIST_JOINS.waiting} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('डिजिटल रांग तिकीट');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <WaitlistJoin {...MOCK_WAITLIST_JOINS.waiting} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
