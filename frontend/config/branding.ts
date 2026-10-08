/**
 * ==============================================================================
 * BHARATQR — MASTER BRANDING & THEME CONFIGURATION
 * ==============================================================================
 * 
 * CRITICAL ARCHITECTURE RULE:
 * This single file controls the brand identity, application name, logo path,
 * and design system tokens for the entire platform across ALL four user roles:
 * - Super Admin (/super-admin)
 * - Restaurant Admin (/admin)
 * - Staff / POS (/staff)
 * - Customer QR Ordering (/customer)
 * 
 * NEVER hardcode the brand name, logo, or color values anywhere else in components.
 * Always import them directly from this file or consume the Tailwind theme classes.
 */

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  secondary: string;
  secondaryLight: string;
  accent: string;
  background: string;
  surface: string;
  surfaceMuted: string;
  border: string;
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  status: {
    pending: string;
    preparing: string;
    ready: string;
    served: string;
    billed: string;
    cancelled: string;
  };
}

export interface BrandingConfig {
  appName: string;
  tagline: string;
  logoPath: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  supportEmail: string;
  colors: ThemeColors;
  themeTokens: {
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      full: string;
    };
    shadows: {
      card: string;
      hover: string;
      modal: string;
    };
  };
}

export const branding: BrandingConfig = {
  appName: "BharatQR",
  tagline: "Intelligent Restaurant & Hotel Live Operations Platform",
  logoPath: "/logo.png",
  primaryColor: "#E8590C", // Vibrant Saffron / Warm Tangerine - energetic & appetizing
  secondaryColor: "#0F172A", // Deep Slate Navy - executive stability & luxury feel
  accentColor: "#10B981", // Fresh Emerald - operational readiness & live action
  fontFamily: "var(--font-inter), system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  supportEmail: "support@bharatqr.internal",
  colors: {
    primary: "#E8590C",
    primaryHover: "#C94A06",
    primaryLight: "#FFF4ED",
    secondary: "#0F172A",
    secondaryLight: "#1E293B",
    accent: "#10B981",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#F1F5F9",
    border: "#E2E8F0",
    text: {
      primary: "#0F172A",
      secondary: "#475569",
      muted: "#94A3B8",
      inverse: "#FFFFFF",
    },
    status: {
      pending: "#F59E0B",   // Warm amber
      preparing: "#3B82F6", // Active blue
      ready: "#10B981",     // Radiant emerald
      served: "#8B5CF6",    // Soft purple
      billed: "#64748B",    // Slate gray
      cancelled: "#EF4444", // Ruby red
    },
  },
  themeTokens: {
    borderRadius: {
      sm: "0.375rem", // 6px
      md: "0.625rem", // 10px
      lg: "0.875rem", // 14px
      xl: "1.25rem",  // 20px
      full: "9999px",
    },
    shadows: {
      card: "0 4px 20px -2px rgba(15, 23, 42, 0.06), 0 2px 6px -1px rgba(15, 23, 42, 0.04)",
      hover: "0 10px 25px -3px rgba(15, 23, 42, 0.1), 0 4px 10px -2px rgba(15, 23, 42, 0.04)",
      modal: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
    },
  },
};

// Direct named exports for frictionless access
export const appName = branding.appName;
export const logoPath = branding.logoPath;
export const primaryColor = branding.primaryColor;
export const secondaryColor = branding.secondaryColor;
export const accentColor = branding.accentColor;
export const fontFamily = branding.fontFamily;
export const themeTokens = branding.themeTokens;

export default branding;
