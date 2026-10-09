import { describe, it, expect } from 'vitest';
import { BrandHeader } from './BrandHeader';
import { renderWithTheme } from '../../../test/renderWithTheme';

describe('BrandHeader', () => {
  it('renders correctly at frames 0, 30, 60 without throwing', () => {
    [0, 30, 60].forEach((frame) => {
      const html = renderWithTheme(
        <BrandHeader
          appName="Spice Garden"
          roleName="Owner Setup"
          currentBranch="Indiranagar Flagship"
          userName="Rajesh Sharma"
          userEmail="owner@spicegarden.in"
          locale="en"
          frame={frame}
        />
      );
      expect(html).toContain('Spice Garden');
      expect(html).toContain('Owner Setup');
      expect(html).toContain('Indiranagar Flagship');
      expect(html).toContain('Rajesh Sharma');
    });
  });

  it('renders back to hub link when showBackToHub is true', () => {
    const html = renderWithTheme(
      <BrandHeader
        appName="Spice Garden"
        roleName="Branch Setup"
        showBackToHub={true}
        locale="en"
      />
    );
    expect(html).toContain('Role Hub');
  });

  it('renders localized in Hindi', () => {
    const html = renderWithTheme(
      <BrandHeader
        appName="स्पाइस गार्डन"
        roleName="शाखा व्यवस्थापक"
        currentBranch="इंदिरानगर मुख्य शाखा"
        locale="hi"
      />,
      { locale: 'hi' }
    );
    expect(html).toContain('स्पाइस गार्डन');
    expect(html).toContain('शाखा:');
    expect(html).toContain('भूमिका हब');
  });

  it('renders localized in Marathi', () => {
    const html = renderWithTheme(
      <BrandHeader
        appName="स्पाइस गार्डन"
        roleName="व्यवस्थापक"
        currentBranch="इंदिरानगर शाखा"
        locale="mr"
      />,
      { locale: 'mr' }
    );
    expect(html).toContain('स्पाइस गार्डन');
    expect(html).toContain('भूमिका केंद्र');
  });
});
