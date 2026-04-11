import type { CSSProperties } from "react";
import type { accent, aubergine, line } from "./palette";
import type { gradients, motion, noise, radii } from "./tokens";

declare module "@mui/material/styles" {
  interface Palette {
    aubergine: typeof aubergine;
    accent: typeof accent;
    line: typeof line;
  }
  interface PaletteOptions {
    aubergine?: typeof aubergine;
    accent?: typeof accent;
    line?: typeof line;
  }

  interface Theme {
    gradients: typeof gradients;
    motion: typeof motion;
    noise: typeof noise;
    radii: typeof radii;
  }
  interface ThemeOptions {
    gradients?: typeof gradients;
    motion?: typeof motion;
    noise?: typeof noise;
    radii?: typeof radii;
  }

  interface TypographyVariants {
    body1Muted: CSSProperties;
    body2Muted: CSSProperties;
    captionMuted: CSSProperties;
    overline: CSSProperties;
    overlineMuted: CSSProperties;
  }
  interface TypographyVariantsOptions {
    body1Muted?: CSSProperties;
    body2Muted?: CSSProperties;
    captionMuted?: CSSProperties;
    overline?: CSSProperties;
    overlineMuted?: CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    body1Muted: true;
    body2Muted: true;
    captionMuted: true;
    overline: true;
    overlineMuted: true;
  }
}

export {};
