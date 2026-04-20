"use client";

import type { ReactElement, ReactNode } from "react";
import { FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { AnyReactForm } from "./types";

interface FormSwitchFieldProps {
  form: AnyReactForm;
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  labelPlacement?: "start" | "end";
  /** Called after the field value changes - use for visibility toggles or other side effects. */
  onChange?: (checked: boolean) => void;
}

/**
 * TanStack Form-bound Switch. Pass `description` to render a secondary caption under the label,
 * or omit both `label` and `description` for a bare switch inside a custom layout.
 */
export function FormSwitchField(props: FormSwitchFieldProps): ReactElement {
  const { form, name, label, description, disabled, labelPlacement = "end", onChange } = props;

  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => {
        const control = (
          <Switch
            checked={!!field.state.value}
            disabled={disabled}
            onChange={(_, checked) => {
              field.handleChange(checked);
              onChange?.(checked);
            }}
          />
        );

        if (!label && !description) return control;

        const labelNode = description ? (
          <Stack spacing={0}>
            {label && (
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {label}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Stack>
        ) : (
          label
        );

        return (
          <FormControlLabel
            control={control}
            label={labelNode}
            labelPlacement={labelPlacement}
            sx={labelPlacement === "start" ? { mx: 0, justifyContent: "space-between" } : undefined}
          />
        );
      }}
    </form.Field>
  );
}
