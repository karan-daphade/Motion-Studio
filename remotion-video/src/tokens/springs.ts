import type { SpringConfig } from 'remotion';

/**
 * Spring configurations for Remotion motion identity.
 * Values derived directly from PRD section 4.3.
 */

export const SPRING_LIGHT: SpringConfig = {
  damping: 18,
  mass: 0.6,
  stiffness: 180,
  overshootClamping: false,
};

export const SPRING_MEDIUM: SpringConfig = {
  damping: 14,
  mass: 0.8,
  stiffness: 120,
  overshootClamping: false,
};

export const SPRING_HEAVY: SpringConfig = {
  damping: 20,
  mass: 1.2,
  stiffness: 90,
  overshootClamping: false,
};

export const SPRING_HERO: SpringConfig = {
  damping: 26,
  mass: 1.6,
  stiffness: 70,
  overshootClamping: false,
};
