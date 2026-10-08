// src/engine/charts/RingChart.tsx
// Frame-Driven Radial Ring Progress Chart (UI-05)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useTheme } from '../../theme';
import { CountUp } from './CountUp';

export interface RingChartProps {
  percentage: number;
  frame?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export const RingChart: React.FC<RingChartProps> = ({
  percentage,
  frame: explicitFrame,
  size = 120,
  strokeWidth = 10,
  label,
}) => {
  const remotionFrame = useCurrentFrame();
  const frame = explicitFrame ?? remotionFrame;
  const { colors, typography } = useTheme();

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const progress = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const currentPercent = percentage * progress;
  const strokeDashoffset = circumference - (currentPercent / 100) * circumference;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.border}
          strokeWidth={strokeWidth}
        />
        {/* Animated progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.accent}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {/* Center percentage label */}
      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontSize: typography.scale.h2 ?? 20,
            fontWeight: 'bold',
            color: colors.text.primary,
          }}
        >
          <CountUp end={percentage} frame={frame} durationInFrames={30} suffix="%" />
        </span>
        {label && (
          <span
            style={{
              fontSize: typography.scale.caption ?? 10,
              color: colors.text.secondary,
            }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
};
