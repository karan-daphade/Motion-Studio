// src/components/clones/KdsCard/KdsCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { KdsCard } from './KdsCard';
import { MOCK_KDS_TICKETS } from '../../../catalog/mock/operations';
import { ThemeProvider } from '../../../theme/ThemeProvider';
import { alternateBrand } from '../../../test/fixtures';

const meta: Meta<typeof KdsCard> = {
  title: 'Clones/Operations/KdsCard',
  component: KdsCard,
  args: {
    ...MOCK_KDS_TICKETS.regular,
    locale: 'en',
    frame: 15,
  },
};

export default meta;
type Story = StoryObj<typeof KdsCard>;

export const Default: Story = {
  args: {
    ...MOCK_KDS_TICKETS.regular,
    locale: 'en',
  },
};

export const UrgentTicket: Story = {
  args: {
    ...MOCK_KDS_TICKETS.urgent,
    locale: 'en',
  },
};

export const LongTextOverflow: Story = {
  args: {
    id: 'TICKET-99',
    token: 'KOT #SPECIAL-8842',
    table: 'VIP Maharaja Terrace Suite T14 (Merged Enclosure)',
    station: 'Tandoor & Live Barbeque Charcoal Grilling Station North',
    server: 'Senior Dining Captain Chandrashekhar Raghunath Deshpande',
    elapsed: '28:45',
    urgent: true,
    items: [
      { name: 'Murgh Dum Biryani Handi Special Edition', qty: 4, notes: 'Extra fried onions, mild spice, separate salan', completed: false },
      { name: 'Amritsari Kulcha with Chole Gravy', qty: 6, notes: 'Extra butter dollop on top', completed: false },
      { name: 'Kesar Pista Kulfi Falooda with Rabdi', qty: 4, notes: 'Serve immediately when mains finish', completed: true },
    ],
    locale: 'en',
  },
};

export const HindiLocale: Story = {
  args: {
    ...MOCK_KDS_TICKETS.regular,
    locale: 'hi',
  },
};

export const MarathiLocale: Story = {
  args: {
    ...MOCK_KDS_TICKETS.urgent,
    locale: 'mr',
  },
};

export const AlternateBrandPalette: Story = {
  render: (args) => (
    <ThemeProvider brand={alternateBrand}>
      <KdsCard {...args} />
    </ThemeProvider>
  ),
  args: {
    ...MOCK_KDS_TICKETS.regular,
    locale: 'en',
  },
};
