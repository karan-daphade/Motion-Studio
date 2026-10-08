// src/components/clones/AlertsDrawer/AlertsDrawer.test.tsx
import { describe, it, expect } from 'vitest';
import { AlertsDrawer } from './AlertsDrawer';
import { MOCK_ALERTS } from '../../../catalog/mock/operations';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('AlertsDrawer UI Clone (frontend/components/operations/panels/AlertsDrawer.tsx)', () => {
  it('renders deterministically at frames 0, 30, 60 without throwing', () => {
    for (const frame of [0, 30, 60]) {
      const html = renderWithTheme(
        <AlertsDrawer {...MOCK_ALERTS.default} frame={frame} locale="en" />
      );
      expect(html).toContain('Live Operational Alerts');
      expect(html).toContain('3 Urgent');
      expect(html).toContain('Table T4');
    }
  });

  it('renders alert types and action buttons', () => {
    const html = renderWithTheme(
      <AlertsDrawer {...MOCK_ALERTS.default} frame={15} locale="en" />
    );
    expect(html).toContain('Access Request');
    expect(html).toContain('Occupied Re-scan');
    expect(html).toContain('Approve');
  });

  it('renders in Hindi and Marathi locales', () => {
    const hiHtml = renderWithTheme(
      <AlertsDrawer {...MOCK_ALERTS.default} frame={10} locale="hi" />,
      { locale: 'hi' }
    );
    expect(hiHtml).toContain('लाइव संचालन अलर्ट');
    expect(hiHtml).toContain('आवश्यक');

    const mrHtml = renderWithTheme(
      <AlertsDrawer {...MOCK_ALERTS.default} frame={10} locale="mr" />,
      { locale: 'mr' }
    );
    expect(mrHtml).toContain('थेट ऑपरेशन्स सूचना');
    expect(mrHtml).toContain('तातडीचे');
  });

  it('renders roadmap coming soon badge when isRoadmap is true', () => {
    const html = renderWithTheme(
      <AlertsDrawer {...MOCK_ALERTS.default} isRoadmap={true} frame={0} />
    );
    expect(html).toContain('Coming soon');
  });
});
