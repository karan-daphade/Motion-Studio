import { describe, it, expect } from 'vitest';
import { StepBranch } from './StepBranch';
import { renderWithTheme } from '../../../test/renderWithTheme';
import { MOCK_BRANCH_SETUP } from '../../../catalog/mock/onboarding';

describe('StepBranch', () => {
  it('renders correctly at frames 0, 30, 60 without throwing', () => {
    [0, 30, 60].forEach((frame) => {
      const html = renderWithTheme(
        <StepBranch
          {...MOCK_BRANCH_SETUP.en}
          locale="en"
          frame={frame}
        />
      );
      expect(html).toContain('Step 1: Branch Setup');
      expect(html).toContain('Spice Garden — Indiranagar Outlet');
      expect(html).toContain('Rajesh Sharma');
    });
  });

  it('renders saving state button text', () => {
    const html = renderWithTheme(
      <StepBranch
        {...MOCK_BRANCH_SETUP.en}
        isSaving={true}
        locale="en"
      />
    );
    expect(html).toContain('Saving Branch Profile...');
  });

  it('renders localized in Hindi', () => {
    const html = renderWithTheme(
      <StepBranch
        {...MOCK_BRANCH_SETUP.hi}
        locale="hi"
      />,
      { locale: 'hi' }
    );
    expect(html).toContain('चरण 1: शाखा सेटअप');
    expect(html).toContain('स्पाइस गार्डन — इंदिरानगर शाखा');
    expect(html).toContain('सहेजें और रसोई सेटअप पर जाएं');
  });

  it('renders localized in Marathi', () => {
    const html = renderWithTheme(
      <StepBranch
        {...MOCK_BRANCH_SETUP.mr}
        locale="mr"
      />,
      { locale: 'mr' }
    );
    expect(html).toContain('टप्पा 1: शाखा सेटअप');
    expect(html).toContain('जतन करा आणि स्वयंपाकघर सेटअपवर जा');
  });
});
