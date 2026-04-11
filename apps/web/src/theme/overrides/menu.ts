import type { Components, Theme } from "@mui/material/styles";
import { accent, line, surfaces, textColors } from "../palette";
import { radii, shadows } from "../tokens";

export const menuOverrides: Components<Theme>["MuiMenu"] = {
  styleOverrides: {
    paper: {
      backgroundColor: surfaces.card,
      backgroundImage: "none",
      border: `1px solid ${line.border}`,
      borderRadius: radii.md,
      boxShadow: shadows.lg,
      marginTop: 4,
    },
    list: {
      padding: 4,
    },
  },
};

export const menuItemOverrides: Components<Theme>["MuiMenuItem"] = {
  styleOverrides: {
    root: {
      fontSize: "0.9375rem",
      minHeight: 40,
      borderRadius: 4,
      color: textColors.primary,
      "&:hover": {
        backgroundColor: "rgba(180,83,9,0.06)",
      },
      "&.Mui-selected": {
        backgroundColor: "rgba(180,83,9,0.10)",
        color: accent.primary,
        "&:hover": {
          backgroundColor: "rgba(180,83,9,0.14)",
        },
      },
    },
  },
};
