// src/engine/cursor/Cursor.tsx
// Interactive Visual Cursor with Click Ripple and Hover State (UI-04)

import React from 'react';
import { useCurrentFrame } from 'remotion';
import { useTheme } from '../../theme';
import { getCursorState, CursorWaypoint, CursorState } from './getCursorState';

export interface CursorProps {
  waypoints?: CursorWaypoint[];
  state?: CursorState;
}

export const Cursor: React.FC<CursorProps> = ({ waypoints, state: explicitState }) => {
  const currentFrame = useCurrentFrame();
  const { colors } = useTheme();

  const state = explicitState ?? (waypoints ? getCursorState(currentFrame, waypoints) : null);

  if (!state || state.opacity === 0) {
    return null;
  }

  const rippleRadius = 14 + state.clickProgress * 32;
  const rippleOpacity = (1 - state.clickProgress) * 0.75;

  return (
    <div
      style={{
        position: 'absolute',
        left: state.x,
        top: state.y,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: `translate(-2px, -2px) scale(${state.scale})`,
      }}
    >
      {/* Click Ripple Effect */}
      {state.isClicking && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: rippleRadius * 2,
            height: rippleRadius * 2,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: `2px solid ${colors.accent}`,
            backgroundColor: colors.accent,
            opacity: rippleOpacity,
          }}
        />
      )}

      {/* Modern Cursor SVG Pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        style={{
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      >
        <path
          d="M3 3L10.5 21L13.8 13.8L21 10.5L3 3Z"
          fill={state.isHovering ? colors.primary : colors.surface}
          stroke={colors.secondary}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
