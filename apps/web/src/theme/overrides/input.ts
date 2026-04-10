import type { Components, Theme } from "@mui/material/styles";
import { accent, aubergine, line, textColors } from "../palette";
import { radii } from "../tokens";
import { fontFamilies } from "../typography";

export const textFieldOverrides: Components<Theme>["MuiTextField"] = {
  defaultProps: {
    variant: "outlined",
    size: "medium",
  },
};

export const outlinedInputOverrides: Components<Theme>["MuiOutlinedInput"] = {
  styleOverrides: {
    root: {
      backgroundColor: "rgba(250,250,250,0.03)",
      borderRadius: radii.md,
      fontFamily: fontFamilies.body,
      fontSize: "0.9375rem",
      color: textColors.primary,
      transition: "border-color 160ms, box-shadow 160ms",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: line.border,
        borderWidth: 1,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: line.borderHi,
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: accent.sunset,
        borderWidth: 1,
        boxShadow: "0 0 0 3px rgba(16,185,129,0.15)",
      },
      "&.Mui-error .MuiOutlinedInput-notchedOutline": {
        borderColor: "#ef4444",
      },
      "&.Mui-disabled": {
        backgroundColor: "rgba(250,250,250,0.015)",
        color: textColors.disabled,
      },
    },
    input: {
      "&::placeholder": {
        color: textColors.disabled,
        opacity: 1,
      },
    },
  },
};

export const inputLabelOverrides: Components<Theme>["MuiInputLabel"] = {
  styleOverrides: {
    root: {
      fontFamily: fontFamilies.body,
      fontSize: "0.9375rem",
      color: textColors.disabled,
      "&.Mui-focused": {
        color: accent.sunset,
      },
    },
  },
};

export const selectOverrides: Components<Theme>["MuiSelect"] = {
  defaultProps: {
    MenuProps: {
      slotProps: {
        paper: {
          sx: {
            backgroundColor: aubergine.elevated,
            border: `1px solid ${line.border}`,
            borderRadius: `${radii.md}px`,
            backgroundImage: "none",
            marginTop: 1,
          },
        },
      },
    },
  },
};

export const formHelperTextOverrides: Components<Theme>["MuiFormHelperText"] = {
  styleOverrides: {
    root: {
      fontFamily: fontFamilies.body,
      fontSize: "0.75rem",
      marginLeft: 2,
      "&.Mui-error": {
        color: "#ef4444",
      },
    },
  },
};
