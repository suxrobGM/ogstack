import type { Components, Theme } from "@mui/material/styles";
import { line, surfaces, textColors } from "../palette";
import { radii, shadows } from "../tokens";
import { fontFamilies } from "../typography";

export const dialogOverrides: Components<Theme>["MuiDialog"] = {
  styleOverrides: {
    paper: {
      backgroundColor: surfaces.card,
      backgroundImage: "none",
      border: `1px solid ${line.border}`,
      borderRadius: radii.lg,
      boxShadow: shadows.lg,
    },
  },
};

export const dialogTitleOverrides: Components<Theme>["MuiDialogTitle"] = {
  styleOverrides: {
    root: {
      fontFamily: fontFamilies.display,
      fontSize: "1.5rem",
      fontWeight: 600,
      color: textColors.primary,
      padding: "24px 24px 8px",
    },
  },
};

export const dialogContentOverrides: Components<Theme>["MuiDialogContent"] = {
  styleOverrides: {
    root: {
      padding: "0 24px 8px",
      color: textColors.secondary,
    },
  },
};

export const dialogActionsOverrides: Components<Theme>["MuiDialogActions"] = {
  styleOverrides: {
    root: {
      padding: "16px 24px 24px",
      gap: 8,
    },
  },
};

export const backdropOverrides: Components<Theme>["MuiBackdrop"] = {
  styleOverrides: {
    root: {
      backgroundColor: "rgba(44,40,37,0.40)",
      backdropFilter: "blur(4px)",
    },
    invisible: {
      backgroundColor: "transparent",
      backdropFilter: "none",
    },
  },
};
