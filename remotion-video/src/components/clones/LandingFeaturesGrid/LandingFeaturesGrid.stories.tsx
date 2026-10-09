// src/components/clones/LandingFeaturesGrid/LandingFeaturesGrid.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LandingFeaturesGrid } from './LandingFeaturesGrid';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';
import { MOCK_LANDING_FEATURES } from '../../../catalog/mock/landing';

const meta: Meta<typeof LandingFeaturesGrid> = {
  title: 'Clones/Landing/LandingFeaturesGrid',
  component: LandingFeaturesGrid,
  args: {
    features: MOCK_LANDING_FEATURES.en,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof LandingFeaturesGrid>;

export const DefaultEnglish: Story = {
  args: {
    features: MOCK_LANDING_FEATURES.en,
    locale: 'en',
  },
};

export const LocalizedHindi: Story = {
  args: {
    features: MOCK_LANDING_FEATURES.hi,
    locale: 'hi',
  },
};

export const LocalizedMarathi: Story = {
  args: {
    features: MOCK_LANDING_FEATURES.mr,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <LandingFeaturesGrid {...args} />
    </ThemeProvider>
  ),
  args: {
    features: MOCK_LANDING_FEATURES.en,
    locale: 'en',
  },
};
