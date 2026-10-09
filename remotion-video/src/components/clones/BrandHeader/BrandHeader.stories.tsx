// src/components/clones/BrandHeader/BrandHeader.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BrandHeader } from './BrandHeader';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof BrandHeader> = {
  title: 'Clones/Brand/BrandHeader',
  component: BrandHeader,
  args: {
    appName: 'Spice Garden',
    roleName: 'Owner Setup',
    currentBranch: 'Indiranagar Flagship',
    userName: 'Rajesh Sharma',
    userEmail: 'owner@spicegarden.in',
    showBackToHub: true,
    hasActiveBranch: true,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof BrandHeader>;

export const DefaultOwner: Story = {
  args: {
    appName: 'Spice Garden',
    roleName: 'Owner Setup',
    currentBranch: 'Indiranagar Flagship',
    userName: 'Rajesh Sharma',
    userEmail: 'owner@spicegarden.in',
    showBackToHub: true,
    hasActiveBranch: true,
    locale: 'en',
  },
};

export const OnboardingWithoutBranch: Story = {
  args: {
    appName: 'Spice Garden',
    roleName: 'Branch Setup',
    userName: 'Rajesh Sharma',
    userEmail: 'owner@spicegarden.in',
    showBackToHub: true,
    hasActiveBranch: false,
    locale: 'en',
  },
};

export const LocalizedHindi: Story = {
  args: {
    appName: 'स्पाइस गार्डन',
    roleName: 'शाखा व्यवस्थापक',
    currentBranch: 'इंदिरानगर मुख्य शाखा',
    userName: 'राजेश शर्मा',
    locale: 'hi',
  },
};

export const LocalizedMarathi: Story = {
  args: {
    appName: 'स्पाइस गार्डन',
    roleName: 'व्यवस्थापक',
    currentBranch: 'इंदिरानगर शाखा',
    userName: 'राजेश शर्मा',
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <BrandHeader {...args} />
    </ThemeProvider>
  ),
  args: {
    appName: 'Spice Garden',
    roleName: 'Owner Setup',
    locale: 'en',
  },
};
