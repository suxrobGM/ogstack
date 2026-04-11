import type { Components, Theme } from "@mui/material/styles";
import { line, surfaces } from "../palette";
import { radii, shadows } from "../tokens";

export const cardOverrides: Components<Theme>["MuiCard"] = {
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: {
      backgroundColor: surfaces.card,
      backgroundImage: "none",
      border: `1px solid ${line.border}`,
      borderRadius: radii.md,
      boxShadow: shadows.md,
    },
  },
};

export const cardContentOverrides: Components<Theme>["MuiCardContent"] = {
  styleOverrides: {
    root: {
      padding: 24,
      "&:last-child": { paddingBottom: 24 },
    },
  },
};

export const cardHeaderOverrides: Components<Theme>["MuiCardHeader"] = {
  styleOverrides: {
    root: {
      padding: "24px 24px 0",
    },
  },
};

export const cardActionsOverrides: Components<Theme>["MuiCardActions"] = {
  styleOverrides: {
    root: {
      padding: "16px 24px 24px",
      gap: 8,
    },
  },
};
