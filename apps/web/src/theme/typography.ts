import type { TypographyVariantsOptions } from "@mui/material/styles";
import { textColors } from "./palette";

/**
 * Font families — referenced via CSS custom properties set by next/font
 * in `app/layout.tsx`. Display pairs with body and mono via a shared variable.
 */
export const fontFamilies = {
  display: "var(--font-syne), 'Arial Black', sans-serif",
  body: "var(--font-dm-sans), system-ui, sans-serif",
  mono: "var(--font-jetbrains-mono), 'Menlo', monospace",
} as const;

export const typography: TypographyVariantsOptions = {
  fontFamily: fontFamilies.body,
  h1: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
    fontSize: "clamp(3rem, 8vw, 6.5rem)",
    lineHeight: 0.92,
    letterSpacing: "-0.04em",
  },
  h2: {
    fontFamily: fontFamilies.display,
    fontWeight: 600,
    fontSize: "2.75rem",
    lineHeight: 1.0,
    letterSpacing: "-0.03em",
  },
  h3: {
    fontFamily: fontFamilies.display,
    fontWeight: 600,
    fontSize: "1.75rem",
    letterSpacing: "-0.02em",
  },
  h4: {
    fontFamily: fontFamilies.display,
    fontWeight: 500,
    fontSize: "1.375rem",
  },
  h5: {
    fontFamily: fontFamilies.display,
    fontWeight: 500,
    fontSize: "1.125rem",
  },
  h6: {
    fontFamily: fontFamilies.display,
    fontWeight: 500,
    fontSize: "1rem",
  },
  body1: {
    fontFamily: fontFamilies.body,
    fontSize: "1rem",
    lineHeight: 1.65,
  },
  body2: {
    fontFamily: fontFamilies.body,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
  },
  button: {
    fontFamily: fontFamilies.body,
    textTransform: "none",
    fontWeight: 600,
    fontSize: "0.9375rem",
    letterSpacing: "-0.005em",
  },
  caption: {
    fontFamily: fontFamilies.mono,
    fontSize: "0.72rem",
    letterSpacing: "0.05em",
  },
  overline: {
    fontFamily: fontFamilies.mono,
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    lineHeight: 1,
    fontWeight: 500,
  },
  body1Muted: {
    fontFamily: fontFamilies.body,
    fontSize: "1rem",
    lineHeight: 1.65,
    color: textColors.secondary,
  },
  body2Muted: {
    fontFamily: fontFamilies.body,
    fontSize: "0.9375rem",
    lineHeight: 1.6,
    color: textColors.secondary,
  },
  captionMuted: {
    fontFamily: fontFamilies.mono,
    fontSize: "0.72rem",
    letterSpacing: "0.05em",
    color: textColors.secondary,
  },
};
