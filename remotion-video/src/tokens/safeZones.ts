/**
 * Safe zone definitions to prevent UI overlays from occluding key content.
 * Values derived directly from PRD section 4.3, guidelines section 4, and motion-identity skill.
 */

export interface SafeZoneInsets {
  top: number;
  bottom: number;
  horizontal: number;
}

/**
 * 9:16 vertical video safe zone (Instagram Reels, YouTube Shorts, TikTok):
 * - Top inset: 14% (header / system UI)
 * - Bottom inset: 25% (captions, platform actions, engagement bar)
 * - Horizontal: 5% each side
 */
export const SAFE_ZONE_9_16: SafeZoneInsets = {
  top: 0.14,
  bottom: 0.25,
  horizontal: 0.05,
};

export const SAFE_ZONE_16_9: SafeZoneInsets = {
  top: 0.05,
  bottom: 0.05,
  horizontal: 0.05,
};

export const SAFE_ZONE_1_1: SafeZoneInsets = {
  top: 0.05,
  bottom: 0.05,
  horizontal: 0.05,
};

export const SAFE_ZONES = {
  '9:16': SAFE_ZONE_9_16,
  '16:9': SAFE_ZONE_16_9,
  '1:1': SAFE_ZONE_1_1,
} as const;
