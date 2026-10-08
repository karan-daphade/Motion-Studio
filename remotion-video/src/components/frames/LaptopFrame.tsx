// src/components/frames/LaptopFrame.tsx
// 2D CSS Laptop Device Frame (UI-03)

import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { getFrameAnchor, AnchorName, Point } from './anchors';

export interface LaptopFrameProps {
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export const LaptopFrame: React.FC<LaptopFrameProps> & {
  getAnchor: (anchor: AnchorName, width?: number, height?: number) => Point;
} = ({ width = 960, height = 600, children }) => {
  const { colors, layout } = useTheme();
  const screenHeight = height - 26;

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxSizing: 'border-box',
      }}
    >
      {/* Display Lid */}
      <div
        style={{
          width: '90%',
          height: screenHeight,
          borderRadius: 14,
          background: colors.secondary,
          padding: 12,
          boxShadow: layout.shadows,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxSizing: 'border-box',
        }}
      >
        {/* Webcam dot */}
        <div
          style={{
            position: 'absolute',
            top: 4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 4,
            height: 4,
            borderRadius: '50%',
            background: colors.border,
            zIndex: 50,
          }}
        />

        {/* Screen */}
        <div
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            borderRadius: 6,
            background: colors.surface,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </div>

      {/* Bottom Chassis Deck */}
      <div
        style={{
          width: '100%',
          height: 18,
          background: colors.secondary,
          borderBottomLeftRadius: 10,
          borderBottomRightRadius: 10,
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        {/* Trackpad notch */}
        <div
          style={{
            width: 90,
            height: 5,
            background: colors.border,
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
          }}
        />
      </div>
    </div>
  );
};

LaptopFrame.getAnchor = (anchor: AnchorName, width = 960, height = 600) =>
  getFrameAnchor('laptop', anchor, width, height);
