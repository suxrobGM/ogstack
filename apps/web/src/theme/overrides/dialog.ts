import type { Components, Theme } from "@mui/material/styles";
import { aubergine, line, textColors } from "../palette";
import { radii } from "../tokens";
import { fontFamilies } from "../typography";

export const dialogOverrides: Components<Theme>["MuiDialog"] = {
  styleOverrides: {
    paper: {
      backgroundColor: aubergine.surface,
      backgroundImage: "none",
      border: `1px solid ${line.border}`,
      borderRadius: radii.lg,
      boxShadow: "0 40px 80px -24px rgba(0,0,0,0.6)",
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
      backgroundColor: "rgba(9,9,11,0.80)",
      backdropFilter: "blur(4px)",
    },
    invisible: {
      backgroundColor: "transparent",
      backdropFilter: "none",
    },
  },
};
