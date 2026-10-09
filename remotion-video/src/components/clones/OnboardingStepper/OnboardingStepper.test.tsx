import { describe, it, expect } from 'vitest';
import { OnboardingStepper } from './OnboardingStepper';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('OnboardingStepper', () => {
  it('renders correctly at frames 0, 30, 60 without throwing', () => {
    [0, 30, 60].forEach((frame) => {
      const html = renderWithTheme(
        <OnboardingStepper
          currentStep={3}
          completedSteps={[1, 2]}
          locale="en"
          frame={frame}
        />
      );
      expect(html).toContain('Step 3 of 7: Shift Management');
      expect(html).toContain('2 of 7 Steps Finished');
    });
  });

  it('renders autosaving badge when isSaving is true', () => {
    const html = renderWithTheme(
      <OnboardingStepper
        currentStep={1}
        completedSteps={[]}
        isSaving={true}
        locale="en"
      />
    );
    expect(html).toContain('Autosaving...');
  });

  it('renders localized in Hindi', () => {
    const html = renderWithTheme(
      <OnboardingStepper
        currentStep={1}
        completedSteps={[]}
        locale="hi"
      />,
      { locale: 'hi' }
    );
    expect(html).toContain('चरण 1 / 7: शाखा सेटअप');
    expect(html).toContain('वर्तमान');
  });

  it('renders localized in Marathi', () => {
    const html = renderWithTheme(
      <OnboardingStepper
        currentStep={2}
        completedSteps={[1]}
        locale="mr"
      />,
      { locale: 'mr' }
    );
    expect(html).toContain('टप्पा 2 / 7: स्वयंपाकघर व्यवस्थापन');
    expect(html).toContain('1 / 7 टप्पे पूर्ण');
  });
});
