import { describe, it, expect } from 'vitest';
import { LandingHeroVisual } from './LandingHeroVisual';
import { renderWithTheme } from '../../../test/renderWithTheme';
import { MOCK_HERO_VISUAL } from '../../../catalog/mock/landing';

describe('LandingHeroVisual', () => {
  it('renders correctly at frames 0, 30, 60 without throwing', () => {
    [0, 30, 60].forEach((frame) => {
      const html = renderWithTheme(
        <LandingHeroVisual
          {...MOCK_HERO_VISUAL.en}
          locale="en"
          frame={frame}
        />
      );
      expect(html).toContain('T-04');
      expect(html).toContain('Table 4 — AC Dining Hall');
      expect(html).toContain('Paneer Tikka Masala');
      expect(html).toContain('Fresh Lime Soda');
      expect(html).toContain('Realtime KDS Active');
    });
  });

  it('renders running bill with Indian Rupee symbol', () => {
    const html = renderWithTheme(
      <LandingHeroVisual
        {...MOCK_HERO_VISUAL.en}
        runningBill={2500}
        locale="en"
      />
    );
    expect(html).toContain('₹2,500');
  });

  it('renders localized in Hindi', () => {
    const html = renderWithTheme(
      <LandingHeroVisual
        {...MOCK_HERO_VISUAL.hi}
        locale="hi"
      />,
      { locale: 'hi' }
    );
    expect(html).toContain('टेबल 4 — एसी डाइनिंग हॉल');
    expect(html).toContain('पनीर टिक्का मसाला');
    expect(html).toContain('लाइव केडीएस सक्रिय');
  });

  it('renders localized in Marathi', () => {
    const html = renderWithTheme(
      <LandingHeroVisual
        {...MOCK_HERO_VISUAL.mr}
        locale="mr"
      />,
      { locale: 'mr' }
    );
    expect(html).toContain('टेबल 4 — एसी डायनिंग हॉल');
    expect(html).toContain('थेट केडीएस सक्रिय');
  });
});
