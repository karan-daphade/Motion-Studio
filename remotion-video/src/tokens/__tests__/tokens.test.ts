import { describe, expect, it } from 'vitest';
import {
  SPRING_LIGHT,
  SPRING_MEDIUM,
  SPRING_HEAVY,
  SPRING_HERO,
} from '../springs';
import { HOUSE_EASE, EXIT_EASE, SNAP_EASE } from '../easing';
import {
  DURATION_MICRO,
  DURATION_STANDARD,
  DURATION_PANEL,
  DURATION_HERO,
  STAGGER_MIN,
  STAGGER_MAX,
  TEXT_HOLD_MIN,
  textHoldFrames,
  PERSPECTIVE,
  GRAIN,
} from '../timing';
import { COLORS } from '../colors';
import { SAFE_ZONE_9_16, SAFE_ZONES } from '../safeZones';

describe('Motion Studio Tokens (PRD 4.3 and Architecture 6.1-6.2)', () => {
  describe('Spring configs', () => {
    it('matches SPRING_LIGHT specification', () => {
      expect(SPRING_LIGHT.damping).toBe(18);
      expect(SPRING_LIGHT.mass).toBe(0.6);
      expect(SPRING_LIGHT.stiffness).toBe(180);
    });

    it('matches SPRING_MEDIUM (house) specification', () => {
      expect(SPRING_MEDIUM.damping).toBe(14);
      expect(SPRING_MEDIUM.mass).toBe(0.8);
      expect(SPRING_MEDIUM.stiffness).toBe(120);
    });

    it('matches SPRING_HEAVY specification', () => {
      expect(SPRING_HEAVY.damping).toBe(20);
      expect(SPRING_HEAVY.mass).toBe(1.2);
      expect(SPRING_HEAVY.stiffness).toBe(90);
    });

    it('matches SPRING_HERO specification', () => {
      expect(SPRING_HERO.damping).toBe(26);
      expect(SPRING_HERO.mass).toBe(1.6);
      expect(SPRING_HERO.stiffness).toBe(70);
    });
  });

  describe('Easing curves', () => {
    it('matches HOUSE_EASE cubic bezier [0.22, 1, 0.36, 1]', () => {
      expect(HOUSE_EASE).toEqual([0.22, 1, 0.36, 1]);
    });

    it('matches EXIT_EASE cubic bezier [0.64, 0, 0.78, 0]', () => {
      expect(EXIT_EASE).toEqual([0.64, 0, 0.78, 0]);
    });

    it('matches SNAP_EASE cubic bezier [0.16, 1, 0.3, 1]', () => {
      expect(SNAP_EASE).toEqual([0.16, 1, 0.3, 1]);
    });
  });

  describe('Timing ladder and text hold', () => {
    it('matches duration ranges', () => {
      expect(DURATION_MICRO.min).toBe(6);
      expect(DURATION_MICRO.max).toBe(9);

      expect(DURATION_STANDARD.min).toBe(12);
      expect(DURATION_STANDARD.max).toBe(18);

      expect(DURATION_PANEL.min).toBe(20);
      expect(DURATION_PANEL.max).toBe(30);

      expect(DURATION_HERO.min).toBe(36);
      expect(DURATION_HERO.max).toBe(60);
    });

    it('matches stagger window (3-5 frames)', () => {
      expect(STAGGER_MIN).toBe(3);
      expect(STAGGER_MAX).toBe(5);
    });

    it('enforces text readability hold floor (>=36 frames + 8 per word over 4)', () => {
      expect(TEXT_HOLD_MIN).toBe(36);
      expect(textHoldFrames(1)).toBe(36);
      expect(textHoldFrames(4)).toBe(36);
      expect(textHoldFrames(5)).toBe(44); // 36 + 1 * 8
      expect(textHoldFrames(7)).toBe(60); // 36 + 3 * 8
    });

    it('matches perspective and grain settings', () => {
      expect(PERSPECTIVE.distance).toBe(1200);
      expect(PERSPECTIVE.rotateX).toBe(10);
      expect(PERSPECTIVE.rotateY).toBe(-8);

      expect(GRAIN.minOpacity).toBe(0.03);
      expect(GRAIN.maxOpacity).toBe(0.04);
    });
  });

  describe('Colors', () => {
    it('contains essential design system tokens', () => {
      expect(COLORS.background).toBe('#0B0F17');
      expect(COLORS.surface).toBe('#151D2A');
      expect(COLORS.primary).toBe('#2563EB');
      expect(COLORS.accent).toBe('#38BDF8');
      expect(COLORS.text).toBe('#F8FAFC');
    });
  });

  describe('Safe Zones', () => {
    it('matches 9:16 vertical safe zone specifications', () => {
      expect(SAFE_ZONE_9_16.top).toBe(0.14);
      expect(SAFE_ZONE_9_16.bottom).toBe(0.25);
      expect(SAFE_ZONE_9_16.horizontal).toBe(0.05);
      expect(SAFE_ZONES['9:16']).toBe(SAFE_ZONE_9_16);
    });
  });
});
