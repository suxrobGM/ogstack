import type { Components, Theme } from "@mui/material/styles";
import NextLink from "next/link";
import { accent, line, textColors } from "../palette";
import { motion, radii } from "../tokens";

export const buttonOverrides: Components<Theme>["MuiButton"] = {
  defaultProps: {
    disableElevation: true,
    disableRipple: false,
    LinkComponent: NextLink,
  },
  styleOverrides: {
    root: {
      borderRadius: radii.md,
      padding: "8px 18px",
      fontSize: "0.875rem",
      transition: `all ${motion.standard}`,
    },
    contained: {
      boxShadow: "none",
      backgroundColor: accent.primary,
      color: "#FFFFFF",
      "&:hover": {
        backgroundColor: "#9A4408",
        boxShadow: `0 8px 24px -8px rgba(180,83,9,0.35)`,
        transform: "translateY(-1px)",
      },
      "&.Mui-disabled": {
        backgroundColor: "rgba(180,83,9,0.2)",
        color: "rgba(44,40,37,0.4)",
      },
    },
    outlined: {
      borderColor: line.borderHi,
      color: textColors.primary,
      backgroundColor: "transparent",
      "&:hover": {
        borderColor: accent.primary,
        color: accent.primary,
        backgroundColor: "rgba(180,83,9,0.04)",
      },
    },
    text: {
      color: textColors.secondary,
      "&:hover": {
        color: accent.primary,
        backgroundColor: "rgba(180,83,9,0.04)",
      },
    },
    sizeSmall: {
      padding: "5px 12px",
      fontSize: "0.8125rem",
    },
    sizeLarge: {
      padding: "10px 24px",
      fontSize: "0.9375rem",
    },
  },
};
