// src/engine/charts/LineChart.tsx
// Frame-Driven Animated Line Chart (UI-05)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../theme';

export interface LineChartProps {
  data: number[];
  frame?: number;
  width?: number;
  height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  frame: explicitFrame,
  width = 300,
  height = 120,
}) => {
  const remotionFrame = useCurrentFrame();
  const frame = explicitFrame ?? remotionFrame;
  const { colors } = useTheme();

  if (data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data, min + 1);

  const points = data.map((val, idx) => {
    const x = (idx / (data.length - 1)) * (width - 20) + 10;
    const y = height - 10 - ((val - min) / (max - min)) * (height - 30);
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const progress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const estimatedLength = width * 1.5;
  const strokeDashoffset = estimatedLength * (1 - progress);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path
        d={pathD}
        fill="none"
        stroke={colors.primary}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={estimatedLength}
        strokeDashoffset={strokeDashoffset}
      />
      {points.map((pt, idx) => {
        const dotFrame = idx * (30 / points.length);
        const dotScale = interpolate(frame, [dotFrame, dotFrame + 10], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <circle
            key={idx}
            cx={pt.x}
            cy={pt.y}
            r={4 * dotScale}
            fill={colors.accent}
          />
        );
      })}
    </svg>
  );
};
