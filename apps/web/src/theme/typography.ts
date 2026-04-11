import type { TypographyVariantsOptions } from "@mui/material/styles";
import { textColors } from "./palette";

/**
 * Font families — referenced via CSS custom properties set by next/font
 * in `app/layout.tsx`. Newsreader (serif) for headings, IBM Plex Sans for body.
 */
export const fontFamilies = {
  display: "var(--font-newsreader), 'Georgia', serif",
  body: "var(--font-ibm-plex), system-ui, sans-serif",
  mono: "var(--font-jetbrains-mono), 'Menlo', monospace",
} as const;

export const typography: TypographyVariantsOptions = {
  fontFamily: fontFamilies.body,
  h1: {
    fontFamily: fontFamilies.display,
    fontWeight: 600,
    fontSize: "clamp(2.5rem, 5vw, 4rem)",
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  },
  h2: {
    fontFamily: fontFamilies.display,
    fontWeight: 600,
    fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
  },
  h3: {
    fontFamily: fontFamilies.display,
    fontWeight: 600,
    fontSize: "clamp(1.375rem, 2.5vw, 1.75rem)",
    letterSpacing: "-0.01em",
  },
  h4: {
    fontFamily: fontFamilies.display,
    fontWeight: 500,
    fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
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
    fontWeight: 500,
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
  overlineMuted: {
    fontFamily: fontFamilies.mono,
    fontSize: "0.7rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    lineHeight: 1,
    fontWeight: 500,
    color: textColors.secondary,
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
