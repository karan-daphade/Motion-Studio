// src/engine/cursor/getCursorState.ts
// Pure Deterministic Cursor State Engine (UI-04)

export interface CursorWaypoint {
  frame: number;
  x: number;
  y: number;
  click?: boolean;
  hover?: boolean;
}

export interface CursorState {
  x: number;
  y: number;
  isHovering: boolean;
  isClicking: boolean;
  clickProgress: number; // 0 (start) to 1 (end of ripple)
  scale: number;
  opacity: number;
}

const CLICK_RIPPLE_DURATION = 15; // frames

function smoothEase(t: number): number {
  // Smooth cubic easeInOut
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function getCursorState(
  frame: number,
  waypoints: CursorWaypoint[]
): CursorState {
  if (!waypoints || waypoints.length === 0) {
    return {
      x: 0,
      y: 0,
      isHovering: false,
      isClicking: false,
      clickProgress: 0,
      scale: 1,
      opacity: 0,
    };
  }

  // Check click events across waypoints
  let isClicking = false;
  let clickProgress = 0;

  for (const wp of waypoints) {
    if (wp.click) {
      const clickFrame = wp.frame;
      if (frame >= clickFrame && frame < clickFrame + CLICK_RIPPLE_DURATION) {
        isClicking = true;
        clickProgress = (frame - clickFrame) / CLICK_RIPPLE_DURATION;
        break;
      }
    }
  }

  // Clamp before first waypoint
  if (frame <= waypoints[0].frame) {
    const first = waypoints[0];
    return {
      x: first.x,
      y: first.y,
      isHovering: Boolean(first.hover),
      isClicking,
      clickProgress,
      scale: first.hover ? 1.15 : 1.0,
      opacity: 1,
    };
  }

  // Clamp after last waypoint
  const last = waypoints[waypoints.length - 1];
  if (frame >= last.frame) {
    return {
      x: last.x,
      y: last.y,
      isHovering: Boolean(last.hover),
      isClicking,
      clickProgress,
      scale: last.hover ? 1.15 : 1.0,
      opacity: 1,
    };
  }

  // Interpolate between waypoints A and B
  let a = waypoints[0];
  let b = waypoints[1];

  for (let i = 0; i < waypoints.length - 1; i++) {
    if (frame >= waypoints[i].frame && frame <= waypoints[i + 1].frame) {
      a = waypoints[i];
      b = waypoints[i + 1];
      break;
    }
  }

  const span = b.frame - a.frame;
  const rawT = span <= 0 ? 0 : (frame - a.frame) / span;
  const t = smoothEase(Math.max(0, Math.min(1, rawT)));

  const x = a.x + (b.x - a.x) * t;
  const y = a.y + (b.y - a.y) * t;
  const isHovering = t < 0.5 ? Boolean(a.hover) : Boolean(b.hover);
  const scale = isHovering ? 1.15 : isClicking ? 0.9 : 1.0;

  return {
    x,
    y,
    isHovering,
    isClicking,
    clickProgress,
    scale,
    opacity: 1,
  };
}
