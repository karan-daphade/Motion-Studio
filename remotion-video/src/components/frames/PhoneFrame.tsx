// src/components/frames/PhoneFrame.tsx
// 2D CSS Mobile Device Frame (UI-03)

import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { getFrameAnchor, AnchorName, Point } from './anchors';

export interface PhoneFrameProps {
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export const PhoneFrame: React.FC<PhoneFrameProps> & {
  getAnchor: (anchor: AnchorName, width?: number, height?: number) => Point;
} = ({ width = 390, height = 844, children }) => {
  const { colors, layout } = useTheme();

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: 44,
        background: colors.secondary,
        padding: 10,
        boxShadow: layout.shadows,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Outer bezel rim */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 36,
          background: colors.surface,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Dynamic Island Pill */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 110,
            height: 28,
            borderRadius: 14,
            background: colors.secondary,
            zIndex: 50,
          }}
        />

        {/* Screen Content */}
        <div
          style={{
            flex: 1,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

PhoneFrame.getAnchor = (anchor: AnchorName, width = 390, height = 844) =>
  getFrameAnchor('phone', anchor, width, height);
