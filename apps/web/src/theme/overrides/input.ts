import type { Components, Theme } from "@mui/material/styles";
import { accent, line, surfaces, textColors } from "../palette";
import { radii, shadows } from "../tokens";
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
      backgroundColor: surfaces.card,
      borderRadius: radii.md,
      fontFamily: fontFamilies.body,
      fontSize: "0.875rem",
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
        borderColor: accent.primary,
        borderWidth: 1,
        boxShadow: shadows.focus,
      },
      "&.Mui-error .MuiOutlinedInput-notchedOutline": {
        borderColor: "#DC2626",
      },
      "&.Mui-disabled": {
        backgroundColor: surfaces.elevated,
        color: textColors.disabled,
      },
    },
    input: {
      padding: "12px 14px",
      "&::placeholder": {
        color: textColors.disabled,
        opacity: 1,
      },
      "&:-webkit-autofill, &:-webkit-autofill:hover, &:-webkit-autofill:focus": {
        WebkitBoxShadow: `0 0 0 100px ${surfaces.card} inset`,
        WebkitTextFillColor: textColors.primary,
        caretColor: textColors.primary,
      },
    },
  },
};

export const inputLabelOverrides: Components<Theme>["MuiInputLabel"] = {
  styleOverrides: {
    root: {
      fontFamily: fontFamilies.body,
      fontSize: "0.875rem",
      lineHeight: 1.25,
      color: textColors.secondary,
      // Align the unshrunk (placeholder-like) label with the custom 12px input padding.
      // MUI's default transform assumes 16.5px padding, which leaves the label sitting too low.
      transform: "translate(14px, 12px) scale(1)",
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -8px) scale(0.8125)",
      },
      "&.Mui-focused": {
        color: accent.primary,
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
            backgroundColor: surfaces.card,
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
        color: "#DC2626",
      },
    },
  },
};
