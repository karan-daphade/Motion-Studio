// src/components/clones/__tests__/brandSwap.test.tsx
// Brand-swap test: render screens with BharatQR theme AND an alternate theme (BRD-10, DS-03, DS-04, BRD-25)
// Asserts colors, fonts, and radii change dynamically and zero brand colors leak through.

import { describe, it, expect } from 'vitest';
import { TableCard } from '../TableCard/TableCard';
import { KdsCard } from '../KdsCard/KdsCard';
import { OnboardingStepper } from '../OnboardingStepper/OnboardingStepper';
import { BrandHeader } from '../BrandHeader/BrandHeader';
import { BillingSummary } from '../BillingSummary/BillingSummary';
import { renderWithTheme } from '../../../test/renderWithTheme';
import { baseBrand, alternateBrand } from '../../../test/fixtures';
import { MOCK_TABLE_CARDS } from '../../../catalog/mock/customerJourney';
import { MOCK_KDS_TICKETS, MOCK_BILLS } from '../../../catalog/mock/operations';

describe('Brand-Swap Test Suite (BRD-10, DS-03, DS-04, BRD-25)', () => {
  it('swaps theme on TableCard with zero color leaks', () => {
    const bharatHtml = renderWithTheme(
      <TableCard {...MOCK_TABLE_CARDS.occupied} frame={0} locale="en" />,
      { brand: baseBrand }
    );
    const altHtml = renderWithTheme(
      <TableCard {...MOCK_TABLE_CARDS.occupied} frame={0} locale="en" />,
      { brand: alternateBrand }
    );

    // Assert baseBrand contains BharatQR primary and medium radii (10px)
    expect(bharatHtml).toContain(baseBrand.colors.primary);
    expect(bharatHtml).toContain(`border-radius:${baseBrand.layout.radii.medium}px`);

    // Assert alternateBrand contains alternate primary and alternate medium radii (4px)
    expect(altHtml).toContain(alternateBrand.colors.primary);
    expect(altHtml).toContain(`border-radius:${alternateBrand.layout.radii.medium}px`);

    // Assert zero primary color leak from BharatQR
    expect(altHtml).not.toContain(baseBrand.colors.primary);
  });

  it('swaps theme on KdsCard with zero color leaks', () => {
    const bharatHtml = renderWithTheme(
      <KdsCard {...MOCK_KDS_TICKETS.urgent} frame={15} locale="en" />,
      { brand: baseBrand }
    );
    const altHtml = renderWithTheme(
      <KdsCard {...MOCK_KDS_TICKETS.urgent} frame={15} locale="en" />,
      { brand: alternateBrand }
    );

    expect(bharatHtml).toContain(baseBrand.colors.primary);
    expect(bharatHtml).toContain(`border-radius:${baseBrand.layout.radii.large}px`);

    expect(altHtml).toContain(alternateBrand.colors.primary);
    expect(altHtml).toContain(`border-radius:${alternateBrand.layout.radii.large}px`);

    expect(altHtml).not.toContain(baseBrand.colors.primary);
  });

  it('swaps theme on OnboardingStepper with zero color leaks', () => {
    const bharatHtml = renderWithTheme(
      <OnboardingStepper currentStep={2} completedSteps={[1]} locale="en" frame={0} />,
      { brand: baseBrand }
    );
    const altHtml = renderWithTheme(
      <OnboardingStepper currentStep={2} completedSteps={[1]} locale="en" frame={0} />,
      { brand: alternateBrand }
    );

    expect(bharatHtml).toContain(baseBrand.colors.primary);
    expect(altHtml).toContain(alternateBrand.colors.primary);
    expect(altHtml).not.toContain(baseBrand.colors.primary);
  });

  it('swaps theme on BrandHeader with zero color leaks', () => {
    const bharatHtml = renderWithTheme(
      <BrandHeader appName="Spice Garden" roleName="Owner" locale="en" frame={0} />,
      { brand: baseBrand }
    );
    const altHtml = renderWithTheme(
      <BrandHeader appName="Spice Garden" roleName="Owner" locale="en" frame={0} />,
      { brand: alternateBrand }
    );

    expect(bharatHtml).toContain(baseBrand.colors.primary);
    expect(altHtml).toContain(alternateBrand.colors.primary);
    expect(altHtml).not.toContain(baseBrand.colors.primary);
  });

  it('swaps theme on BillingSummary with zero color leaks', () => {
    const bharatHtml = renderWithTheme(
      <BillingSummary {...MOCK_BILLS.default} frame={15} locale="en" />,
      { brand: baseBrand }
    );
    const altHtml = renderWithTheme(
      <BillingSummary {...MOCK_BILLS.default} frame={15} locale="en" />,
      { brand: alternateBrand }
    );

    expect(bharatHtml).toContain(baseBrand.colors.primary);
    expect(altHtml).toContain(alternateBrand.colors.primary);
    expect(altHtml).not.toContain(baseBrand.colors.primary);
  });
});