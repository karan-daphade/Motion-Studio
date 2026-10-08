// src/components/clones/TableCard/TableCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TableCard } from './TableCard';
import { MOCK_TABLE_CARDS } from '../../../catalog/mock/customerJourney';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof TableCard> = {
  title: 'Clones/CustomerJourney/TableCard',
  component: TableCard,
  args: {
    ...MOCK_TABLE_CARDS.occupied,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof TableCard>;

export const Default: Story = {
  args: {
    ...MOCK_TABLE_CARDS.occupied,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    tableNumber: '104-Extended-VIP-Pavilion',
    shortCode: 'VIP-Table-104-Terrace-Garden-North',
    section: 'Executive Banquet Private Enclosure Suite',
    capacity: 24,
    status: 'assigned',
    assignedGuest: {
      name: 'Shri Vikramaditya Harishchandra Deshmukh & Extended Family',
      token: 'WL-EXT-9994',
      guestCount: 22,
    },
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_TABLE_CARDS.occupied,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_TABLE_CARDS.assigned,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <TableCard {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_TABLE_CARDS.occupied,
    locale: 'en',
  },
};
