// src/components/frames/TabletFrame.tsx
// 2D CSS Tablet Device Frame (UI-03)

import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { getFrameAnchor, AnchorName, Point } from './anchors';

export interface TabletFrameProps {
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export const TabletFrame: React.FC<TabletFrameProps> & {
  getAnchor: (anchor: AnchorName, width?: number, height?: number) => Point;
} = ({ width = 820, height = 580, children }) => {
  const { colors, layout } = useTheme();

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        borderRadius: 28,
        background: colors.secondary,
        padding: 16,
        boxShadow: layout.shadows,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
      }}
    >
      {/* Front Camera dot */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: colors.border,
          zIndex: 50,
        }}
      />

      {/* Screen Area */}
      <div
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          borderRadius: 16,
          background: colors.surface,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </div>
    </div>
  );
};

TabletFrame.getAnchor = (anchor: AnchorName, width = 820, height = 580) =>
  getFrameAnchor('tablet', anchor, width, height);
