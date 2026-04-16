import type { Components, Theme } from "@mui/material/styles";
import { textColors } from "../palette";
import { radii } from "../tokens";
import { fontFamilies } from "../typography";

export const chipOverrides: Components<Theme>["MuiChip"] = {
  defaultProps: {
    size: "small",
  },
  styleOverrides: {
    root: {
      borderRadius: radii.xs,
      fontFamily: fontFamilies.mono,
      fontSize: 11,
      fontWeight: 500,
      letterSpacing: "0.03em",
      height: 24,
      color: textColors.primary,
    },
    outlined: {
      borderColor: "currentColor",
      borderWidth: 1,
      backgroundColor: "transparent",
    },
    filled: {
      backgroundColor: "rgba(44,40,37,0.06)",
    },
    label: {
      paddingLeft: 10,
      paddingRight: 10,
    },
  },
};
