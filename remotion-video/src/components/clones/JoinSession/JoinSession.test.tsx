// src/components/clones/JoinSession/JoinSession.test.tsx
import { describe, it, expect } from 'vitest';
import { JoinSession } from './JoinSession';
import { MOCK_JOIN_SESSIONS } from '../../../catalog/mock/customerJourney';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('JoinSession UI Clone (frontend/app/session/join/join-session-client.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <JoinSession {...MOCK_JOIN_SESSIONS.default} frame={frame} locale="en" />
      );
      expect(html).toContain('Table 7');
      expect(html).toContain('Collaborative Dining');
      expect(html).toContain('Join Group Session');
    }
  });

  it('renders guest name and mobile simulation fields', () => {
    const html = renderWithTheme(
      <JoinSession
        {...MOCK_JOIN_SESSIONS.default}
        guestNameMock="Sneha Patil"
        mobileNumberMock="+91 99887 76655"
        frame={15}
        locale="en"
      />
    );
    expect(html).toContain('Sneha Patil');
    expect(html).toContain('+91 99887 76655');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <JoinSession {...MOCK_JOIN_SESSIONS.default} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('सहयोगी डाइनिंग');

    const mrHtml = renderWithTheme(
      <JoinSession {...MOCK_JOIN_SESSIONS.default} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('सहयोगी जेवण');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <JoinSession {...MOCK_JOIN_SESSIONS.default} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
