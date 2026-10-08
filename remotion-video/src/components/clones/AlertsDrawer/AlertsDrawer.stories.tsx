// src/components/clones/AlertsDrawer/AlertsDrawer.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { AlertsDrawer } from './AlertsDrawer';
import { MOCK_ALERTS } from '../../../catalog/mock/operations';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof AlertsDrawer> = {
  title: 'Clones/Operations/AlertsDrawer',
  component: AlertsDrawer,
  args: {
    ...MOCK_ALERTS.default,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof AlertsDrawer>;

export const Default: Story = {
  args: {
    ...MOCK_ALERTS.default,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    branchName: 'Swad Sagar Pure Veg Heritage Fine Dining & Convention Pavilion Extended',
    urgentCount: 12,
    alerts: [
      {
        id: 'alt-ext-1',
        type: 'access_request',
        table: 'VIP Maharaja Terrace Suite T14 (Merged Enclosure)',
        message: 'Multiple new guests from Wedding Entourage attempting to join private table session without biometric PIN authorization',
        timeAgo: '12m ago (Overdue)',
        urgent: true,
      },
      {
        id: 'alt-ext-2',
        type: 'occupied_scan',
        table: 'Grand Banquet Table B2 (24 Seats)',
        message: 'Second party scanned QR while first party bill settlement was already in progress at cashier desk',
        timeAgo: '18m ago',
        urgent: true,
      },
    ],
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_ALERTS.default,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_ALERTS.default,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <AlertsDrawer {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_ALERTS.default,
    locale: 'en',
  },
};
