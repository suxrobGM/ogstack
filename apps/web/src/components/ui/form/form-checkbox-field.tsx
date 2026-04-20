"use client";

import type { ReactElement, ReactNode } from "react";
import { Box, Checkbox, FormControlLabel, FormHelperText } from "@mui/material";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { AnyReactForm } from "./types";

interface FormCheckboxFieldProps {
  form: AnyReactForm;
  name: string;
  label: ReactNode;
  disabled?: boolean;
  helperText?: ReactNode;
  /** Called after the field value changes - use for visibility toggles or other side effects. */
  onChange?: (checked: boolean) => void;
}

/** TanStack Form-bound checkbox with a label. Use `onChange` for side effects like toggling dependent field visibility. */
export function FormCheckboxField(props: FormCheckboxFieldProps): ReactElement {
  const { form, name, label, disabled, helperText, onChange } = props;

  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => (
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!field.state.value}
                disabled={disabled}
                onChange={(e) => {
                  field.handleChange(e.target.checked);
                  onChange?.(e.target.checked);
                }}
              />
            }
            label={label}
          />
          {helperText && <FormHelperText sx={{ pl: 4, mt: -0.5 }}>{helperText}</FormHelperText>}
        </Box>
      )}
    </form.Field>
  );
}
