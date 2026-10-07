/**
 * Cubic-bezier curve tokens for interpolate() and transitions.
 * Values derived directly from PRD section 4.3.
 */

export type CubicBezierTuple = [number, number, number, number];

export const HOUSE_EASE: CubicBezierTuple = [0.22, 1, 0.36, 1];
export const EXIT_EASE: CubicBezierTuple = [0.64, 0, 0.78, 0];
export const SNAP_EASE: CubicBezierTuple = [0.16, 1, 0.3, 1];
