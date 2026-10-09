import { describe, it, expect } from 'vitest';
import { LandingFeaturesGrid } from './LandingFeaturesGrid';
import { renderWithTheme } from '../../../test/renderWithTheme';
import { MOCK_LANDING_FEATURES } from '../../../catalog/mock/landing';

describe('LandingFeaturesGrid', () => {
  it('renders correctly at frames 0, 30, 60 without throwing', () => {
    [0, 30, 60].forEach((frame) => {
      const html = renderWithTheme(
        <LandingFeaturesGrid
          features={MOCK_LANDING_FEATURES.en}
          locale="en"
          frame={frame}
        />
      );
      expect(html).toContain('Enterprise-Grade POS &amp; Live Operations');
      expect(html).toContain('Seamless QR Table Sessions');
      expect(html).toContain('Station-Level Kitchen Routing (KDS)');
      expect(html).toContain('Enterprise Multi-Branch Control');
    });
  });

  it('renders localized in Hindi', () => {
    const html = renderWithTheme(
      <LandingFeaturesGrid
        features={MOCK_LANDING_FEATURES.hi}
        locale="hi"
      />,
      { locale: 'hi' }
    );
    expect(html).toContain('सहज क्यूआर टेबल सत्र');
    expect(html).toContain('स्टेशन-स्तरीय रसोई रूटिंग (केडीएस)');
  });

  it('renders localized in Marathi', () => {
    const html = renderWithTheme(
      <LandingFeaturesGrid
        features={MOCK_LANDING_FEATURES.mr}
        locale="mr"
      />,
      { locale: 'mr' }
    );
    expect(html).toContain('सुलभ क्यूआर टेबल सत्र');
    expect(html).toContain('स्टेशननुसार किचन रूटिंग (केडीएस)');
  });
});
