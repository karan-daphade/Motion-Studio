// src/components/clones/OrderListPanel/OrderListPanel.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { OrderListPanel } from './OrderListPanel';
import { MOCK_OPERATION_ORDERS } from '../../../catalog/mock/operations';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof OrderListPanel> = {
  title: 'Clones/Operations/OrderListPanel',
  component: OrderListPanel,
  args: {
    ...MOCK_OPERATION_ORDERS.preparing,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof OrderListPanel>;

export const Default: Story = {
  args: {
    ...MOCK_OPERATION_ORDERS.preparing,
    locale: 'en',
  },
};

export const ReadyOrder: Story = {
  args: {
    ...MOCK_OPERATION_ORDERS.ready,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    id: 'ORD-SPECIAL-8842',
    table: 'VIP Royal Terrace Pavilion Table 14',
    timeAgo: '45 mins ago (Delayed)',
    status: 'preparing',
    token: 'KOT #SPECIAL-42',
    total: 3850,
    items: [
      { name: 'Kashmiri Mutton Rogan Josh Special', qty: 2, tag: 'non-veg', price: 1100 },
      { name: 'Paneer Lababdar Handi with Roasted Spices', qty: 3, tag: 'veg', price: 960 },
      { name: 'Garlic Butter Cheese Naan Basket', qty: 5, tag: 'veg', price: 850 },
      { name: 'Kesar Badam Thandai Seasonal Edition', qty: 4, tag: 'veg', price: 940 },
    ],
    notes: 'Severe peanut allergy on table. Prepare dishes in dedicated non-nut cookware.',
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_OPERATION_ORDERS.preparing,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_OPERATION_ORDERS.ready,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <OrderListPanel {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_OPERATION_ORDERS.preparing,
    locale: 'en',
  },
};
