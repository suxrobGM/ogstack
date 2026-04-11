import type { Components, Theme } from "@mui/material/styles";
import { aubergine, line, textColors } from "../palette";
import { motion } from "../tokens";
import { fontFamilies } from "../typography";

export const tableOverrides: Components<Theme>["MuiTable"] = {
  defaultProps: {
    sx: { minWidth: 600 },
  },
  styleOverrides: {
    root: {
      borderCollapse: "separate",
      borderSpacing: 0,
    },
  },
};

export const tableHeadOverrides: Components<Theme>["MuiTableHead"] = {
  styleOverrides: {
    root: {
      "& .MuiTableCell-root": {
        fontFamily: fontFamilies.mono,
        fontSize: "0.68rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        fontWeight: 500,
        color: textColors.secondary,
        borderBottom: `1px solid ${line.border}`,
        paddingTop: 14,
        paddingBottom: 14,
        backgroundColor: aubergine.elevated,
      },
    },
  },
};

export const tableBodyOverrides: Components<Theme>["MuiTableBody"] = {
  styleOverrides: {
    root: {
      "& .MuiTableRow-root": {
        transition: `background-color ${motion.fast}`,
        "&:hover": {
          backgroundColor: "rgba(16,185,129,0.04)",
        },
        "&:last-of-type .MuiTableCell-root": {
          borderBottom: "none",
        },
      },
      "& .MuiTableCell-root": {
        fontFamily: fontFamilies.body,
        fontSize: "0.875rem",
        color: textColors.primary,
        borderBottom: `1px solid ${line.divider}`,
        paddingTop: 16,
        paddingBottom: 16,
      },
    },
  },
};

export const tableCellOverrides: Components<Theme>["MuiTableCell"] = {
  styleOverrides: {
    root: {
      borderBottom: "none",
    },
  },
};

export const tableRowOverrides: Components<Theme>["MuiTableRow"] = {
  styleOverrides: {
    root: {},
  },
};
