// src/engine/cursor/__tests__/cursor.test.ts
import { describe, it, expect } from 'vitest';
import { getCursorState, CursorWaypoint } from '../getCursorState';

describe('Cursor System (UI-04)', () => {
  const waypoints: CursorWaypoint[] = [
    { frame: 0, x: 100, y: 100, hover: false },
    { frame: 30, x: 200, y: 200, click: true, hover: true },
    { frame: 60, x: 400, y: 300, hover: false },
  ];

  it('clamps coordinates to the first waypoint before frame 0', () => {
    const state = getCursorState(-5, waypoints);
    expect(state.x).toBe(100);
    expect(state.y).toBe(100);
    expect(state.isClicking).toBe(false);
  });

  it('clamps coordinates to the last waypoint after frame 60', () => {
    const state = getCursorState(100, waypoints);
    expect(state.x).toBe(400);
    expect(state.y).toBe(300);
    expect(state.isClicking).toBe(false);
  });

  it('interpolates smoothly between waypoints at frame 15', () => {
    const state = getCursorState(15, waypoints);
    // At t=0.5, cubic ease is 0.5, so x=150, y=150
    expect(state.x).toBeCloseTo(150, 0);
    expect(state.y).toBeCloseTo(150, 0);
  });

  it('detects exact click frame with clickProgress = 0', () => {
    const state = getCursorState(30, waypoints);
    expect(state.x).toBe(200);
    expect(state.y).toBe(200);
    expect(state.isClicking).toBe(true);
    expect(state.clickProgress).toBe(0);
    expect(state.isHovering).toBe(true);
  });

  it('tracks click ripple progression through click window', () => {
    // 7 frames after frame 30 (duration = 15)
    const state = getCursorState(37, waypoints);
    expect(state.isClicking).toBe(true);
    expect(state.clickProgress).toBeCloseTo(7 / 15, 3);
  });

  it('resets clicking state once ripple duration has passed', () => {
    const state = getCursorState(46, waypoints);
    expect(state.isClicking).toBe(false);
    expect(state.clickProgress).toBe(0);
  });
});
