/**
 * OGStack palette — Emerald direction.
 *
 * Clean zinc-black base with emerald green + cyan accents.
 * Named `textColors` instead of `text` to avoid shadowing MUI's `palette.text`
 * when these tokens are spread into the palette in `theme.ts`.
 */

export const aubergine = {
  base: "#0a0a10",
  surface: "#14141e",
  elevated: "#1e1e2a",
  hi: "#282836",
} as const;

export const accent = {
  sunset: "#10b981",
  amber: "#22d3ee",
  violet: "#34d399",
} as const;

export const textColors = {
  primary: "#fafafa",
  secondary: "#a1a1aa",
  disabled: "#52525b",
} as const;

export const feedback = {
  error: "#ef4444",
  success: "#22c55e",
  info: "#3b82f6",
  warning: "#eab308",
} as const;

export const line = {
  divider: "rgba(250,250,250,0.08)",
  border: "rgba(250,250,250,0.12)",
  borderHi: "rgba(250,250,250,0.20)",
} as const;
