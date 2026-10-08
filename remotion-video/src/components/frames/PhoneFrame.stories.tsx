// src/components/frames/PhoneFrame.stories.tsx
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PhoneFrame } from './PhoneFrame';
import { useTheme } from '../../theme';

const SampleScreen: React.FC = () => {
  const { colors, locale } = useTheme();
  return (
    <div
      style={{
        flex: 1,
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: colors.surface,
        color: colors.text.primary,
        fontFamily: 'inherit',
      }}
    >
      <h2 style={{ fontSize: 20, marginBottom: 8 }}>Phone Screen</h2>
      <p style={{ color: colors.text.secondary }}>Active locale: {locale}</p>
    </div>
  );
};

const meta: Meta<typeof PhoneFrame> = {
  title: 'Frames/PhoneFrame',
  component: PhoneFrame,
};

export default meta;
type Story = StoryObj<typeof PhoneFrame>;

export const Default: Story = {
  args: {
    width: 390,
    height: 844,
    children: <SampleScreen />,
  },
};
