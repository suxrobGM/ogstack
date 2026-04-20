import type { Components, Theme } from "@mui/material/styles";
import NextLink from "next/link";

export const linkOverrides: Components<Theme>["MuiLink"] = {
  defaultProps: {
    component: NextLink,
  },
  styleOverrides: {
    root: {
      textDecoration: "none",
    },
  },
};
