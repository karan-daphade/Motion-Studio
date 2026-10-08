// src/components/frames/ThermalReceiptFrame.tsx
// 2D CSS 80mm Thermal Receipt Paper Frame (UI-03)

import React from 'react';
import { useTheme } from '../../theme/useTheme';
import { getFrameAnchor, AnchorName, Point } from './anchors';

export interface ThermalReceiptFrameProps {
  width?: number;
  height?: number;
  children: React.ReactNode;
}

export const ThermalReceiptFrame: React.FC<ThermalReceiptFrameProps> & {
  getAnchor: (anchor: AnchorName, width?: number, height?: number) => Point;
} = ({ width = 340, height = 620, children }) => {
  const { colors, layout } = useTheme();

  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: layout.shadows,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      {/* Serrated Top Zig-Zag edge */}
      <div
        style={{
          width: '100%',
          height: 10,
          background: `radial-gradient(circle, transparent, transparent 50%, ${colors.surface} 50%, ${colors.surface}) -7px -7px / 14px 14px repeat-x`,
        }}
      />

      {/* Thermal Paper Body */}
      <div
        style={{
          flex: 1,
          width: '100%',
          background: colors.surface,
          padding: '16px 20px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'monospace',
          color: colors.text.primary,
        }}
      >
        {children}
      </div>

      {/* Serrated Bottom Zig-Zag edge */}
      <div
        style={{
          width: '100%',
          height: 10,
          background: `radial-gradient(circle, transparent, transparent 50%, ${colors.surface} 50%, ${colors.surface}) -7px 0px / 14px 14px repeat-x`,
        }}
      />
    </div>
  );
};

ThermalReceiptFrame.getAnchor = (anchor: AnchorName, width = 340, height = 620) =>
  getFrameAnchor('receipt', anchor, width, height);
