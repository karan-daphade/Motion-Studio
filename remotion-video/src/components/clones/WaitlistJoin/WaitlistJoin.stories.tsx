// src/components/clones/WaitlistJoin/WaitlistJoin.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { WaitlistJoin } from './WaitlistJoin';
import { MOCK_WAITLIST_JOINS } from '../../../catalog/mock/customerJourney';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof WaitlistJoin> = {
  title: 'Clones/CustomerJourney/WaitlistJoin',
  component: WaitlistJoin,
  args: {
    ...MOCK_WAITLIST_JOINS.waiting,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof WaitlistJoin>;

export const Default: Story = {
  args: {
    ...MOCK_WAITLIST_JOINS.waiting,
    locale: 'en',
  },
};

export const TableAssigned: Story = {
  args: {
    ...MOCK_WAITLIST_JOINS.tableAssigned,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    restaurantName: 'Swad Sagar Pure Veg Heritage Fine Dining & Convention Pavilion',
    branchName: 'Ferguson College Road Premier Flagship Extended Complex',
    sectionName: 'Air Conditioned Grand Family Banquet Hall Suite',
    tokenNumber: 'WL-SPECIAL-9921',
    guestName: 'Shrimati Priyadarshini Kulkarni-Deshpande & Wedding Entourage',
    partySize: 18,
    position: 12,
    partiesAhead: 11,
    estimatedWaitMinutes: 55,
    status: 'WAITING',
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_WAITLIST_JOINS.waiting,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_WAITLIST_JOINS.tableAssigned,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <WaitlistJoin {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_WAITLIST_JOINS.waiting,
    locale: 'en',
  },
};
