// src/components/clones/JoinSession/JoinSession.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { JoinSession } from './JoinSession';
import { MOCK_JOIN_SESSIONS } from '../../../catalog/mock/customerJourney';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof JoinSession> = {
  title: 'Clones/CustomerJourney/JoinSession',
  component: JoinSession,
  args: {
    ...MOCK_JOIN_SESSIONS.default,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof JoinSession>;

export const Default: Story = {
  args: {
    ...MOCK_JOIN_SESSIONS.default,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    restaurantName: 'Swad Sagar Pure Veg Heritage Fine Dining & Convention Pavilion',
    branchName: 'Ferguson College Road Premier Flagship Extended Complex',
    tableLabel: 'Royal Maharaja Table 108 (Merged Suite)',
    currentDinersCount: 12,
    existingSessionDuration: '1h 45m',
    guestNameMock: 'Dr. Chandrashekhar Raghunath Deshpande',
    mobileNumberMock: '+91 98220 12345 (Primary)',
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_JOIN_SESSIONS.default,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_JOIN_SESSIONS.default,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <JoinSession {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_JOIN_SESSIONS.default,
    locale: 'en',
  },
};
