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
      borderRadius: radii.pill,
      padding: "11px 24px",
      transition: `all ${motion.standard}`,
    },
    contained: {
      boxShadow: "none",
      backgroundColor: accent.sunset,
      color: textColors.primary,
      "&:hover": {
        backgroundColor: accent.sunset,
        boxShadow: "0 12px 32px -12px rgba(255,91,46,0.5)",
        transform: "translateY(-1px)",
      },
      "&.Mui-disabled": {
        backgroundColor: "rgba(255,91,46,0.3)",
        color: "rgba(255,248,240,0.5)",
      },
    },
    outlined: {
      borderColor: line.border,
      color: textColors.primary,
      backgroundColor: "rgba(255,248,240,0.03)",
      "&:hover": {
        borderColor: line.borderHi,
        backgroundColor: "rgba(255,248,240,0.06)",
      },
    },
    text: {
      color: textColors.secondary,
      "&:hover": {
        color: accent.sunset,
        backgroundColor: "transparent",
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
