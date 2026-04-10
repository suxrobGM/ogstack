import type { Components, Theme } from "@mui/material/styles";

/**
 * MuiTypography component-level overrides.
 * Most typography tuning lives in the top-level `typography` theme key
 * (see `theme/typography.ts`). This file exists to keep parity with the
 * other override modules and house any future per-variant tweaks.
 */
export const typographyOverrides: Components<Theme>["MuiTypography"] = {
  defaultProps: {
    variantMapping: {
      h1: "h1",
      h2: "h2",
      h3: "h3",
      h4: "h4",
      h5: "h5",
      h6: "h6",
      body1: "p",
      body2: "p",
      body1Muted: "p",
      body2Muted: "p",
      captionMuted: "span",
    },
  },
  styleOverrides: {
    gutterBottom: {
      marginBottom: "0.5em",
    },
  },
};
