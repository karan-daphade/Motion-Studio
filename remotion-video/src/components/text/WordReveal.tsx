// src/components/text/WordReveal.tsx
// Pure Word-by-Word Text Animation (LOC-02)
// STRICT RULE: Splits ONLY by whole words, never by individual characters, preserving Devanagari conjuncts.

import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';

export interface WordRevealProps {
  text: string;
  frame?: number;
  staggerDelay?: number;
  durationInFrames?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const WordReveal: React.FC<WordRevealProps> = ({
  text,
  frame: explicitFrame,
  staggerDelay = 3,
  durationInFrames = 12,
  className,
  style,
}) => {
  const remotionFrame = useCurrentFrame();
  const frame = explicitFrame ?? remotionFrame;

  // Split strictly by whitespace to ensure whole words / conjuncts are preserved
  const words = text.trim().split(/\s+/);

  return (
    <span
      className={className}
      style={{
        display: 'inline-block',
        lineHeight: 1.4,
        ...style,
      }}
    >
      {words.map((word, idx) => {
        const startFrame = idx * staggerDelay;
        const progress = interpolate(
          frame,
          [startFrame, startFrame + durationInFrames],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }
        );

        // Smooth cubic ease-out
        const eased = 1 - Math.pow(1 - progress, 3);
        const opacity = eased;
        const translateY = (1 - eased) * 12;

        return (
          <span
            key={`${word}-${idx}`}
            style={{
              display: 'inline-block',
              marginRight: idx < words.length - 1 ? '0.28em' : 0,
              opacity,
              transform: `translateY(${translateY}px)`,
              willChange: 'transform, opacity',
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
};
