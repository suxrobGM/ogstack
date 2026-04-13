"use client";

import type { ReactElement } from "react";
import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";

export interface SelectInputItem<V extends string = string> {
  value: V;
  label: string;
}

interface SelectInputProps<V extends string = string> {
  label: string;
  value: V;
  onChange: (value: V) => void;
  items: ReadonlyArray<SelectInputItem<V>>;
  size?: "small" | "medium";
  minWidth?: number;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Plain (non-form-bound) MUI select with floating label. Use for toolbars,
 * filters, and simple stateful pickers where TanStack Form isn't involved.
 */
export function SelectInput<V extends string = string>(props: SelectInputProps<V>): ReactElement {
  const { label, value, onChange, items, size = "small", minWidth = 140, disabled, sx } = props;

  return (
    <FormControl
      size={size}
      disabled={disabled}
      sx={[{ minWidth }, ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        onChange={(e: SelectChangeEvent<V>) => onChange(e.target.value as V)}
      >
        {items.map((item) => (
          <MenuItem key={item.value} value={item.value}>
            {item.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
