/**
 * Default color palette tokens for Motion Studio.
 * Specific brand overrides are provided by catalog/brand schemas at render time.
 */

export const COLORS = {
  background: '#0B0F17',
  backgroundLight: '#F8FAFC',
  surface: '#151D2A',
  surfaceLight: '#FFFFFF',
  surfaceSubtle: '#1E293B',
  surfaceMuted: '#F1F5F9',
  primary: '#2563EB',
  secondary: '#0F172A',
  accent: '#38BDF8',
  accentEmerald: '#10B981',
  text: '#F8FAFC',
  textDark: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textDim: '#64748B',
  textInverse: '#FFFFFF',
  border: '#334155',
  borderLight: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
} as const;

export type ColorToken = keyof typeof COLORS;
