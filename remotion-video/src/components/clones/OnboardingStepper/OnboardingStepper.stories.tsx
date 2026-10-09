// src/components/clones/OnboardingStepper/OnboardingStepper.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingStepper } from './OnboardingStepper';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof OnboardingStepper> = {
  title: 'Clones/Onboarding/OnboardingStepper',
  component: OnboardingStepper,
  args: {
    currentStep: 1,
    completedSteps: [],
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof OnboardingStepper>;

export const DefaultStep1: Story = {
  args: {
    currentStep: 1,
    completedSteps: [],
    locale: 'en',
  },
};

export const InProgressStep4: Story = {
  args: {
    currentStep: 4,
    completedSteps: [1, 2, 3],
    isSaving: true,
    locale: 'en',
  },
};

export const LocalizedHindi: Story = {
  args: {
    currentStep: 3,
    completedSteps: [1, 2],
    locale: 'hi',
  },
};

export const LocalizedMarathi: Story = {
  args: {
    currentStep: 6,
    completedSteps: [1, 2, 3, 4, 5],
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <OnboardingStepper {...args} />
    </ThemeProvider>
  ),
  args: {
    currentStep: 2,
    completedSteps: [1],
    locale: 'en',
  },
};
