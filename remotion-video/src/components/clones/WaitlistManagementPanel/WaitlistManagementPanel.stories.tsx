// src/components/clones/WaitlistManagementPanel/WaitlistManagementPanel.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { WaitlistManagementPanel } from './WaitlistManagementPanel';
import { MOCK_WAITLIST_MANAGEMENT } from '../../../catalog/mock/operations';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof WaitlistManagementPanel> = {
  title: 'Clones/Operations/WaitlistManagementPanel',
  component: WaitlistManagementPanel,
  args: {
    ...MOCK_WAITLIST_MANAGEMENT.default,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof WaitlistManagementPanel>;

export const Default: Story = {
  args: {
    ...MOCK_WAITLIST_MANAGEMENT.default,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    sectionName: 'Grand Executive Rooftop Garden Terrace (Enclosed VIP Lounge)',
    activeCount: 18,
    avgWaitMins: 45,
    entries: [
      { id: 'wl-ext-1', token: 'WL-SPECIAL-01', guestName: 'Shri Vikramaditya Harishchandra Deshmukh Senior', partySize: 12, waitMinutes: 38, status: 'TABLE_ASSIGNED', assignedTable: 'VIP Suite T108' },
      { id: 'wl-ext-2', token: 'WL-SPECIAL-02', guestName: 'Dr. Priyadarshini Kulkarni-Deshpande', partySize: 8, waitMinutes: 25, status: 'WAITING' },
      { id: 'wl-ext-3', token: 'WL-SPECIAL-03', guestName: 'Commodore Rajeshwar Singh Rathore & Guests', partySize: 6, waitMinutes: 14, status: 'WAITING' },
    ],
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_WAITLIST_MANAGEMENT.default,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_WAITLIST_MANAGEMENT.default,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <WaitlistManagementPanel {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_WAITLIST_MANAGEMENT.default,
    locale: 'en',
  },
};
