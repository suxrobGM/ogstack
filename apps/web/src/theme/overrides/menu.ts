import type { Components, Theme } from "@mui/material/styles";
import { accent, aubergine, line, textColors } from "../palette";
import { radii } from "../tokens";

export const menuOverrides: Components<Theme>["MuiMenu"] = {
  styleOverrides: {
    paper: {
      backgroundColor: aubergine.elevated,
      backgroundImage: "none",
      border: `1px solid ${line.border}`,
      borderRadius: radii.md,
      boxShadow: "0 24px 48px -16px rgba(0,0,0,0.6)",
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
        backgroundColor: "rgba(255,91,46,0.08)",
      },
      "&.Mui-selected": {
        backgroundColor: "rgba(255,91,46,0.14)",
        color: accent.sunset,
        "&:hover": {
          backgroundColor: "rgba(255,91,46,0.18)",
        },
      },
    },
  },
};
