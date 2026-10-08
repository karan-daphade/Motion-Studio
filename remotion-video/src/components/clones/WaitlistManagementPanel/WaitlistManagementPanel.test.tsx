// src/components/clones/WaitlistManagementPanel/WaitlistManagementPanel.test.tsx
import { describe, it, expect } from 'vitest';
import { WaitlistManagementPanel } from './WaitlistManagementPanel';
import { MOCK_WAITLIST_MANAGEMENT } from '../../../catalog/mock/operations';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('WaitlistManagementPanel UI Clone (frontend/components/operations/panels/WaitingListPanel.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <WaitlistManagementPanel {...MOCK_WAITLIST_MANAGEMENT.default} frame={frame} locale="en" />
      );
      expect(html).toContain('Ground Floor AC Hall');
      expect(html).toContain('WL-08');
      expect(html).toContain('Aarav Deshmukh');
      expect(html).toContain('Seat Assigned Party');
    }
  });

  it('renders assigned table status pill', () => {
    const html = renderWithTheme(
      <WaitlistManagementPanel {...MOCK_WAITLIST_MANAGEMENT.default} frame={15} locale="en" />
    );
    expect(html).toContain('Assigned T2');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <WaitlistManagementPanel {...MOCK_WAITLIST_MANAGEMENT.default} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('फ्लोर प्रतीक्षा सूची');
    expect(hiHtml).toContain('टेबल तय T2');

    const mrHtml = renderWithTheme(
      <WaitlistManagementPanel {...MOCK_WAITLIST_MANAGEMENT.default} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('फ्लोअर रांग व्यवस्थापन');
    expect(mrHtml).toContain('टेबल नियुक्त T2');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <WaitlistManagementPanel {...MOCK_WAITLIST_MANAGEMENT.default} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
