"use client";

import type { ReactElement, ReactNode } from "react";
import { Stack, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { AnyReactForm } from "./types";

export interface ToggleItem<V> {
  value: V;
  label: ReactNode;
  disabled?: boolean;
}

interface FormToggleFieldProps<V> {
  form: AnyReactForm;
  name: string;
  label?: ReactNode;
  items: ReadonlyArray<ToggleItem<V>>;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
  /** Called after the field value changes - use for visibility toggles or other side effects. */
  onChange?: (value: V) => void;
}

/**
 * TanStack Form-bound exclusive ToggleButtonGroup. Works with any value type (string, boolean, number)
 * as MUI compares items with `===`. Null selections (clicking the active button) are ignored.
 */
export function FormToggleField<V>(props: FormToggleFieldProps<V>): ReactElement {
  const { form, name, label, items, fullWidth, size = "small", onChange } = props;

  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => (
        <Stack spacing={label ? 0.5 : 0}>
          {label && <Typography variant="body2Muted">{label}</Typography>}
          <ToggleButtonGroup
            exclusive
            size={size}
            fullWidth={fullWidth}
            value={field.state.value as V}
            onChange={(_, next: V | null) => {
              if (next === null) return;
              field.handleChange(next);
              onChange?.(next);
            }}
          >
            {items.map((item, i) => (
              <ToggleButton
                key={i}
                value={item.value as unknown as string}
                disabled={item.disabled}
              >
                {item.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      )}
    </form.Field>
  );
}
