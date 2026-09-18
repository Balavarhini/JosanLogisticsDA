/**
 * Design tokens extracted from the Josan Logistics Driver App design reference
 * (colors, typography, spacing, radii and shadows). Keep this file as the single
 * source of truth for styling — components should read from here rather than
 * hardcoding hex values or magic numbers.
 */

export const colors = {
  // Brand — Gold + Dust Orange Palette
  primary: "#C96A32",       // Dust Orange
  primaryDark: "#A94F22",   // Deep Dust Orange
  gold: "#D4AF5A",          // Premium Gold
  goldLight: "#E8D39A",     // Light Gold
  darkCharcoal: "#1F1F1F",  // Dark Charcoal
  navy: "#1F1F1F",          // Alias for Dark Charcoal to maintain backwards compatibility

  // Text
  textPrimary: "#1F1F1F",   // Dark Charcoal
  textSecondary: "#6B7280", // Muted Charcoal
  textMuted: "#9CA3AF",
  textOnDark: "#FFFFFF",

  // Surfaces
  background: "#FAF8F3",    // Warm Off-White
  warmOffWhite: "#FAF8F3",  // Warm Off-White surface
  softBeige: "#F2EDE3",     // Soft Beige surface
  card: "#FFFFFF",          // Pure White
  border: "#E8D39A",        // Light Gold border
  borderGold: "#D4AF5A",    // Premium Gold border
  overlay: "rgba(31, 31, 31, 0.5)",

  // Status
  success: "#16A34A",
  successSoft: "rgba(22, 163, 74, 0.12)",
  warning: "#D4AF5A",       // Premium Gold
  warningSoft: "rgba(212, 175, 90, 0.15)",
  error: "#DC2626",
  errorSoft: "rgba(220, 38, 38, 0.12)",
  danger: "#DC2626",
  info: "#C96A32",          // Dust Orange Accent
  infoSoft: "rgba(201, 106, 50, 0.12)",
  primarySoft: "rgba(201, 106, 50, 0.12)",
  goldSoft: "rgba(212, 175, 90, 0.15)",
  neutralSoft: "#F2EDE3",   // Soft Beige

  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
} as const;

export const Colors = colors;
export const danger = colors.error;

export const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: "700" as const },
  h2: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  body: { fontSize: 16, lineHeight: 22, fontWeight: "400" as const },
  bodySmall: { fontSize: 15, lineHeight: 20, fontWeight: "400" as const },
  bodyMedium: { fontSize: 15, lineHeight: 20, fontWeight: "500" as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: "400" as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: "600" as const },
  metric: { fontSize: 26, lineHeight: 30, fontWeight: "700" as const },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  button: 12,
  card: 16,
  sheet: 24,
  pill: 999,
} as const;

export const shadow = {
  card: {
    shadowColor: "#1F1F1F",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  floating: {
    shadowColor: "#C96A32",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

export const hitSlop = { top: 8, bottom: 8, left: 8, right: 8 };

/** Minimum touch target size, per accessibility guidance. */
export const MIN_TOUCH_TARGET = 44;

const theme = { colors, typography, spacing, radius, shadow, hitSlop, MIN_TOUCH_TARGET };
export default theme;
