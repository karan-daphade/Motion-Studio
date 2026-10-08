// src/components/clones/BillingSummary/BillingSummary.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { BillingSummary } from './BillingSummary';
import { MOCK_BILLS } from '../../../catalog/mock/operations';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof BillingSummary> = {
  title: 'Clones/Operations/BillingSummary',
  component: BillingSummary,
  args: {
    ...MOCK_BILLS.default,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof BillingSummary>;

export const Default: Story = {
  args: {
    ...MOCK_BILLS.default,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    table: 'VIP Maharaja Private Dining Enclosure Table 108',
    billNumber: 'INV-2026-MAHARAJA-SPECIAL-998842',
    party: 'Grand Wedding Reception Family (Party of 24 Guests)',
    duration: '2h 35m (Extended Session)',
    subtotal: 18450,
    cgst: 461.25,
    sgst: 461.25,
    total: 19372.5,
    itemsCount: 38,
    paymentMode: 'Card',
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_BILLS.default,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_BILLS.default,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <BillingSummary {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_BILLS.default,
    locale: 'en',
  },
};
