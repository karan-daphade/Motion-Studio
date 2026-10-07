/**
 * Default color palette tokens for Motion Studio.
 * Specific brand overrides are provided by catalog/brand schemas at render time.
 */

export const COLORS = {
  background: '#0B0F17',
  surface: '#151D2A',
  surfaceSubtle: '#1E293B',
  primary: '#2563EB',
  accent: '#38BDF8',
  text: '#F8FAFC',
  textMuted: '#94A3B8',
  border: '#334155',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
} as const;

export type ColorToken = keyof typeof COLORS;
