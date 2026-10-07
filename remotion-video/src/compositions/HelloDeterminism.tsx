import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { SPRING_MEDIUM } from '../tokens/springs';
import { COLORS } from '../tokens/colors';
import { SAFE_ZONE_9_16 } from '../tokens/safeZones';

export interface HelloDeterminismProps {
  title?: string;
  subtitle?: string;
}

export const HelloDeterminism: React.FC<HelloDeterminismProps> = ({
  title = 'Motion Studio',
  subtitle = 'Deterministic Motion Engine',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Entrance spring animation using house token
  const entrance = spring({
    frame,
    fps,
    config: SPRING_MEDIUM,
  });

  const opacity = entrance;
  const translateY = interpolate(entrance, [0, 1], [40, 0]);
  const scale = interpolate(entrance, [0, 1], [0.95, 1]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: COLORS.background,
        color: COLORS.text,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: 'sans-serif',
        paddingTop: height * SAFE_ZONE_9_16.top,
        paddingBottom: height * SAFE_ZONE_9_16.bottom,
        paddingLeft: width * SAFE_ZONE_9_16.horizontal,
        paddingRight: width * SAFE_ZONE_9_16.horizontal,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          opacity,
          transform: `translateY(${translateY}px) scale(${scale})`,
          textAlign: 'center',
        }}
      >
        <h1
          style={{
            fontSize: 72,
            fontWeight: 800,
            margin: 0,
            color: COLORS.accent,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: 32,
            marginTop: 16,
            color: COLORS.textMuted,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </p>
      </div>
    </AbsoluteFill>
  );
};
