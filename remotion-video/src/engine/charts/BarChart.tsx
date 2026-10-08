// src/engine/charts/BarChart.tsx
// Frame-Driven Bar Chart (UI-05)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../theme';

export interface BarDataPoint {
  label: string;
  value: number;
}

export interface BarChartProps {
  data: BarDataPoint[];
  frame?: number;
  maxValue?: number;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  frame: explicitFrame,
  maxValue: explicitMax,
  height = 160,
}) => {
  const remotionFrame = useCurrentFrame();
  const frame = explicitFrame ?? remotionFrame;
  const { colors, typography, layout } = useTheme();

  const max =
    explicitMax ??
    Math.max(...data.map((d) => d.value), 1);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height,
        gap: layout.spacingUnit * 1.5,
        paddingTop: layout.spacingUnit * 2,
        paddingBottom: layout.spacingUnit,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {data.map((item, idx) => {
        const stagger = idx * 3;
        const progress = interpolate(frame, [stagger, stagger + 20], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const eased = 1 - Math.pow(1 - progress, 3);
        const barHeight = Math.max(4, (item.value / max) * (height - 30) * eased);

        return (
          <div
            key={item.label}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
            }}
          >
            {/* Bar Pill */}
            <div
              style={{
                width: '100%',
                maxWidth: 32,
                height: barHeight,
                backgroundColor: colors.primary,
                borderRadius: layout.radii.small,
              }}
            />
            {/* Label */}
            <span
              style={{
                marginTop: layout.spacingUnit * 0.75,
                fontSize: typography.scale.caption ?? 12,
                color: colors.text.secondary,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
