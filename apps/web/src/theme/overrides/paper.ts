import type { Components, Theme } from "@mui/material/styles";
import { line, surfaces } from "../palette";
import { radii, shadows } from "../tokens";

export const paperOverrides: Components<Theme>["MuiPaper"] = {
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
