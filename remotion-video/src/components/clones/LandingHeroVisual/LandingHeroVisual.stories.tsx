// src/components/clones/LandingHeroVisual/LandingHeroVisual.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { LandingHeroVisual } from './LandingHeroVisual';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';
import { MOCK_HERO_VISUAL } from '../../../catalog/mock/landing';

const meta: Meta<typeof LandingHeroVisual> = {
  title: 'Clones/Landing/LandingHeroVisual',
  component: LandingHeroVisual,
  args: {
    ...MOCK_HERO_VISUAL.en,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof LandingHeroVisual>;

export const DefaultEnglish: Story = {
  args: {
    ...MOCK_HERO_VISUAL.en,
    locale: 'en',
  },
};

export const HighVolumeOrder: Story = {
  args: {
    tableCode: 'T-12',
    tableName: 'Table 12 — Family Banquet Hall',
    guestCount: 8,
    runningBill: 4680,
    mainKitchenItems: [
      { qty: 2, name: 'Paneer Butter Masala', status: 'ready' },
      { qty: 4, name: 'Garlic Naan', status: 'ready' },
      { qty: 2, name: 'Dal Makhani', status: 'preparing' },
    ],
    beverageItems: [
      { qty: 4, name: 'Sweet Lassi', status: 'served' },
      { qty: 2, name: 'Masala Chai', status: 'prep' },
    ],
    avgTurnaroundMins: 9.1,
    locale: 'en',
  },
};

export const LocalizedHindi: Story = {
  args: {
    ...MOCK_HERO_VISUAL.hi,
    locale: 'hi',
  },
};

export const LocalizedMarathi: Story = {
  args: {
    ...MOCK_HERO_VISUAL.mr,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <LandingHeroVisual {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_HERO_VISUAL.en,
    locale: 'en',
  },
};
