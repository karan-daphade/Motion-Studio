// .storybook/preview.tsx
import React from 'react';
import type { Preview } from '@storybook/react';
import { Player } from '@remotion/player';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { Brand } from '../src/schema/brand';
import brandJson from '../../brands/bharatqr/brand.json';

const defaultBrand = Brand.parse(brandJson);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  args: {
    frame: 0,
    locale: 'en',
  },
  argTypes: {
    frame: {
      control: { type: 'range', min: 0, max: 120, step: 1 },
      description: 'Current animation frame for Remotion hooks',
    },
    locale: {
      control: 'select',
      options: ['en', 'hi', 'mr'],
      description: 'Active UI localization',
    },
  },
  decorators: [
    (Story, context) => {
      const frame = typeof context.args.frame === 'number' ? context.args.frame : 0;
      const locale = context.args.locale || 'en';

      const StoryWrapper: React.FC = () => {
        return (
          <ThemeProvider brand={defaultBrand} locale={locale}>
            <Story />
          </ThemeProvider>
        );
      };

      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#0F172A',
            padding: '24px',
          }}
        >
          <Player
            key={`frame-${frame}-${locale}`}
            component={StoryWrapper}
            durationInFrames={120}
            fps={30}
            compositionWidth={1280}
            compositionHeight={720}
            initialFrame={frame}
            controls={false}
            style={{
              width: '100%',
              maxWidth: '1280px',
              height: 'auto',
              background: 'transparent',
            }}
          />
        </div>
      );
    },
  ],
};

export default preview;
