/**
 * OGStack palette - Warm Studio direction.
 *
 * Cream/sand base with amber accent and charcoal text.
 * Named `textColors` instead of `text` to avoid shadowing MUI's `palette.text`
 * when these tokens are spread into the palette in `theme.ts`.
 */

export const surfaces = {
  base: "#F7F3ED",
  card: "#FFFDF9",
  elevated: "#EDE8DF",
  hover: "#E5DFD5",
} as const;

export const accent = {
  primary: "#B45309",
  secondary: "#D97706",
  dark: "#92400E",
} as const;

export const textColors = {
  primary: "#2C2825",
  secondary: "#8C8378",
  disabled: "#9E958A",
} as const;

export const feedback = {
  error: "#DC2626",
  success: "#15803D",
  info: "#2563EB",
  warning: "#CA8A04",
} as const;

export const line = {
  divider: "#D5CEC3",
  border: "#CBC3B6",
  borderHi: "#B8AFA0",
} as const;
