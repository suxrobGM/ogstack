import type { Components, Theme } from "@mui/material/styles";
import { accent, line, textColors } from "../palette";
import { motion, radii } from "../tokens";

export const buttonOverrides: Components<Theme>["MuiButton"] = {
  defaultProps: {
    disableElevation: true,
    disableRipple: false,
  },
  styleOverrides: {
    root: {
      borderRadius: radii.md,
      padding: "9px 18px",
      fontSize: "0.875rem",
      transition: `all ${motion.standard}`,
      "@media (min-width: 900px)": {
        padding: "11px 24px",
        fontSize: "0.9375rem",
      },
    },
    contained: {
      boxShadow: "none",
      backgroundColor: accent.sunset,
      color: "#052e16",
      "&:hover": {
        backgroundColor: "#059669",
        boxShadow: "0 8px 24px -8px rgba(16,185,129,0.45)",
        transform: "translateY(-1px)",
      },
      "&.Mui-disabled": {
        backgroundColor: "rgba(16,185,129,0.25)",
        color: "rgba(250,250,250,0.4)",
      },
    },
    outlined: {
      borderColor: line.borderHi,
      color: textColors.primary,
      backgroundColor: "transparent",
      "&:hover": {
        borderColor: accent.sunset,
        color: accent.sunset,
        backgroundColor: "rgba(16,185,129,0.06)",
      },
    },
    text: {
      color: textColors.secondary,
      "&:hover": {
        color: accent.sunset,
        backgroundColor: "rgba(16,185,129,0.06)",
      },
    },
    sizeSmall: {
      padding: "7px 16px",
      fontSize: "0.8125rem",
    },
    sizeLarge: {
      padding: "14px 28px",
      fontSize: "1rem",
    },
  },
};
