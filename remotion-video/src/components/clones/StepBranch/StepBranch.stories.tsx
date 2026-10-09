// src/components/clones/StepBranch/StepBranch.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StepBranch } from './StepBranch';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';
import { MOCK_BRANCH_SETUP } from '../../../catalog/mock/onboarding';

const meta: Meta<typeof StepBranch> = {
  title: 'Clones/Onboarding/StepBranch',
  component: StepBranch,
  args: {
    ...MOCK_BRANCH_SETUP.en,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof StepBranch>;

export const DefaultEnglish: Story = {
  args: {
    ...MOCK_BRANCH_SETUP.en,
    locale: 'en',
  },
};

export const SavingState: Story = {
  args: {
    ...MOCK_BRANCH_SETUP.en,
    isSaving: true,
    locale: 'en',
  },
};

export const LocalizedHindi: Story = {
  args: {
    ...MOCK_BRANCH_SETUP.hi,
    locale: 'hi',
  },
};

export const LocalizedMarathi: Story = {
  args: {
    ...MOCK_BRANCH_SETUP.mr,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <StepBranch {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_BRANCH_SETUP.en,
    locale: 'en',
  },
};
