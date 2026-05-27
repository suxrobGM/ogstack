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
    root: ({ theme }) => ({
      padding: theme.spacing(1),
      "&:last-child": { paddingBottom: theme.spacing(2) },
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(2),
        "&:last-child": { paddingBottom: theme.spacing(3) },
      },
    }),
  },
};

export const cardHeaderOverrides: Components<Theme>["MuiCardHeader"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(1, 1, 0),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(2, 2, 0),
      },
    }),
    title: ({ theme }) => theme.typography.h6,
    subheader: ({ theme }) => theme.typography.body2Muted,
  },
};

export const cardActionsOverrides: Components<Theme>["MuiCardActions"] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(1.5, 2, 2),
      gap: theme.spacing(1),
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(2, 3, 3),
      },
    }),
  },
};
