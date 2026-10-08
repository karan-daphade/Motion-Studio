// src/components/clones/TableQrScan/TableQrScan.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TableQrScan } from './TableQrScan';
import { MOCK_TABLE_QR_SCANS } from '../../../catalog/mock/customerJourney';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof TableQrScan> = {
  title: 'Clones/CustomerJourney/TableQrScan',
  component: TableQrScan,
  args: {
    ...MOCK_TABLE_QR_SCANS.available,
    locale: 'en',
    frame: 20,
  },
};

export default meta;
type Story = StoryObj<typeof TableQrScan>;

export const Default: Story = {
  args: {
    ...MOCK_TABLE_QR_SCANS.available,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    tableLabel: 'VIP Royal Maharaja Banquet Pavilion Suite 108',
    seatingCapacity: 28,
    branchName: 'Swad Sagar Pure Veg Premium Family Dining & Convention Center',
    branchCity: 'Shivaji Nagar, District Pune, Maharashtra 411005',
    sectionName: 'Grand Executive Rooftop Glasshouse Garden Lawn',
    status: 'OCCUPIED',
    activeSessionGuestCount: 24,
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_TABLE_QR_SCANS.available,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_TABLE_QR_SCANS.occupied,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <TableQrScan {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_TABLE_QR_SCANS.available,
    locale: 'en',
  },
};
