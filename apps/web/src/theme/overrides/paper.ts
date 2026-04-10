import type { Components, Theme } from "@mui/material/styles";
import { aubergine, line } from "../palette";
import { radii } from "../tokens";

export const paperOverrides: Components<Theme>["MuiPaper"] = {
  defaultProps: {
    elevation: 0,
  },
  styleOverrides: {
    root: {
      backgroundColor: aubergine.surface,
      backgroundImage: "none",
      border: `1px solid ${line.border}`,
      borderRadius: radii.md,
      boxShadow: "none",
    },
  },
};
