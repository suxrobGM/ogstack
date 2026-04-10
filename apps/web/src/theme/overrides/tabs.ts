import type { Components, Theme } from "@mui/material/styles";
import { accent, line, textColors } from "../palette";
import { fontFamilies } from "../typography";

export const tabsOverrides: Components<Theme>["MuiTabs"] = {
  styleOverrides: {
    root: {
      borderBottom: `1px solid ${line.border}`,
      minHeight: 44,
    },
    indicator: {
      backgroundColor: accent.sunset,
      height: 2,
      borderRadius: 1,
    },
  },
};

export const tabOverrides: Components<Theme>["MuiTab"] = {
  styleOverrides: {
    root: {
      fontFamily: fontFamilies.body,
      textTransform: "none",
      minHeight: 44,
      fontWeight: 500,
      fontSize: "0.9375rem",
      color: textColors.secondary,
      padding: "10px 20px",
      "&.Mui-selected": {
        color: textColors.primary,
      },
      "&:hover": {
        color: textColors.primary,
      },
    },
  },
};
