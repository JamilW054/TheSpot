/**
 * Design tokens — single source of truth for colors, radius, spacing.
 * Consumed by globals.css (CSS variables) and components.
 * No gradients.
 */

export const primary = "#0979CD";
export const primaryForeground = "#FFFFFF";

export const secondary = "#6B7280";
export const secondaryForeground = "#FFFFFF";

export const accent = "#0EA5E9";
export const accentForeground = "#FFFFFF";

export const muted = "#F3F4F6";
export const mutedForeground = "#6B7280";

export const border = "#E5E7EB";

export const destructive = "#DC2626";
export const destructiveForeground = "#FFFFFF";

/** Dark theme equivalents */
export const darkColors = {
  primary: "#0D8AE6",
  primaryForeground: "#FFFFFF",
  secondary: "#9CA3AF",
  secondaryForeground: "#111827",
  accent: "#38BDF8",
  accentForeground: "#0F172A",
  muted: "#1F2937",
  mutedForeground: "#9CA3AF",
  border: "#374151",
  destructive: "#EF4444",
  destructiveForeground: "#FFFFFF",
} as const;

export const radius = {
  none: "0",
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px",
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
} as const;
