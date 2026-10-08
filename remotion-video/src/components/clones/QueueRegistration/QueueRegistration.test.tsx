// src/components/clones/QueueRegistration/QueueRegistration.test.tsx
import { describe, it, expect } from 'vitest';
import { QueueRegistration } from './QueueRegistration';
import { MOCK_QUEUE_REGISTRATIONS } from '../../../catalog/mock/customerJourney';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('QueueRegistration UI Clone (frontend/app/q/[branchCode]/[sectionCode]/queue-registration-client.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <QueueRegistration {...MOCK_QUEUE_REGISTRATIONS.default} frame={frame} locale="en" />
      );
      expect(html).toContain('Join Dining Waitlist');
      expect(html).toContain('Swad Sagar Pure Veg');
      expect(html).toContain('Get Queue Token');
    }
  });

  it('renders live queue stats and selected party size', () => {
    const html = renderWithTheme(
      <QueueRegistration
        {...MOCK_QUEUE_REGISTRATIONS.default}
        selectedPartySize={6}
        frame={15}
        locale="en"
      />
    );
    expect(html).toContain('5');
    expect(html).toContain('20 mins');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <QueueRegistration {...MOCK_QUEUE_REGISTRATIONS.default} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('प्रतीक्षा सूची में शामिल हों');

    const mrHtml = renderWithTheme(
      <QueueRegistration {...MOCK_QUEUE_REGISTRATIONS.default} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('प्रतीक्षा यादीत सामील व्हा');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <QueueRegistration {...MOCK_QUEUE_REGISTRATIONS.default} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
