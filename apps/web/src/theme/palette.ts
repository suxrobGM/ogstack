/**
 * OGStack palette — Chroma direction.
 *
 * Named `textColors` instead of `text` to avoid shadowing MUI's `palette.text`
 * when these tokens are spread into the palette in `theme.ts`.
 */

export const aubergine = {
  base: "#0A0612",
  surface: "#15101F",
  elevated: "#1F1730",
  hi: "#2A2040",
} as const;

export const accent = {
  sunset: "#FF5B2E",
  amber: "#FFC947",
  violet: "#7B3FF2",
} as const;

export const textColors = {
  primary: "#FFF8F0",
  secondary: "#D6CCE0",
  disabled: "#B3A6C0",
} as const;

export const feedback = {
  error: "#FF4B4B",
  success: "#5CE1A1",
  info: "#7B3FF2",
  warning: "#FFC947",
} as const;

export const line = {
  divider: "rgba(255,248,240,0.08)",
  border: "rgba(255,248,240,0.10)",
  borderHi: "rgba(255,248,240,0.18)",
} as const;
