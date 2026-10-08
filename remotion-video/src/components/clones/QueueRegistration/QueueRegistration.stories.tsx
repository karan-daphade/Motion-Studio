// src/components/clones/QueueRegistration/QueueRegistration.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { QueueRegistration } from './QueueRegistration';
import { MOCK_QUEUE_REGISTRATIONS } from '../../../catalog/mock/customerJourney';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof QueueRegistration> = {
  title: 'Clones/CustomerJourney/QueueRegistration',
  component: QueueRegistration,
  args: {
    ...MOCK_QUEUE_REGISTRATIONS.default,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof QueueRegistration>;

export const Default: Story = {
  args: {
    ...MOCK_QUEUE_REGISTRATIONS.default,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    restaurantName: 'Swad Sagar Pure Veg Heritage Fine Dining & Convention Pavilion',
    branchName: 'Ferguson College Road Premier Flagship Extended Complex',
    sectionName: 'Ground Floor Grand Royal Dining Enclosure',
    currentQueueLength: 14,
    averageWaitMinutes: 45,
    selectedPartySize: 8,
    guestNameMock: 'Shri Vikramaditya Harishchandra Deshmukh Senior',
    mobileNumberMock: '+91 98220 99887 (Dedicated Line)',
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_QUEUE_REGISTRATIONS.default,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_QUEUE_REGISTRATIONS.default,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <QueueRegistration {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_QUEUE_REGISTRATIONS.default,
    locale: 'en',
  },
};
