/**
 * Timing ladder, staggers, hold times and spatial perspective tokens.
 * Values derived directly from PRD section 4.3.
 */

export const DURATION_MICRO = { min: 6, max: 9, default: 8 } as const;
export const DURATION_STANDARD = { min: 12, max: 18, default: 15 } as const;
export const DURATION_PANEL = { min: 20, max: 30, default: 24 } as const;
export const DURATION_HERO = { min: 36, max: 60, default: 45 } as const;

export const STAGGER_MIN = 3;
export const STAGGER_MAX = 5;
export const STAGGER_DEFAULT = 4;

export const TEXT_HOLD_MIN = 36;
export const TEXT_HOLD_FRAMES_PER_WORD_OVER_FOUR = 8;

/**
 * Calculates text hold frames ensuring readability floor.
 * Rule: Minimum 36 frames, plus 8 frames per word beyond four.
 */
export function textHoldFrames(wordCount: number): number {
  if (wordCount <= 4) {
    return TEXT_HOLD_MIN;
  }
  return TEXT_HOLD_MIN + (wordCount - 4) * TEXT_HOLD_FRAMES_PER_WORD_OVER_FOUR;
}

export const PERSPECTIVE = {
  distance: 1200,
  rotateX: 10,
  rotateY: -8,
} as const;

export const GRAIN = {
  minOpacity: 0.03,
  maxOpacity: 0.04,
  defaultOpacity: 0.035,
} as const;
