// src/engine/charts/CountUp.tsx
// Frame-Driven Numeric CountUp Animation (UI-05)

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { formatIndianNumber } from './format';

export interface CountUpProps {
  start?: number;
  end: number;
  frame?: number;
  durationInFrames?: number;
  prefix?: string;
  suffix?: string;
  isCurrency?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const CountUp: React.FC<CountUpProps> = ({
  start = 0,
  end,
  frame: explicitFrame,
  durationInFrames = 30,
  prefix = '',
  suffix = '',
  isCurrency = false,
  className,
  style,
}) => {
  const remotionFrame = useCurrentFrame();
  const frame = explicitFrame ?? remotionFrame;

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Smooth quadratic ease-out
  const eased = 1 - Math.pow(1 - progress, 2);
  const currentValue = start + (end - start) * eased;
  const formatted = formatIndianNumber(currentValue, isCurrency);

  return (
    <span className={className} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};
