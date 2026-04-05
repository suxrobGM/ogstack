"use client";

import type { ReactElement } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { AnyReactForm } from "./types";

interface FormCheckboxFieldProps {
  form: AnyReactForm;
  name: string;
  label: string;
  /** Called after the field value changes — use for visibility toggles or other side effects. */
  onChange?: (checked: boolean) => void;
}

/** TanStack Form-bound checkbox with a label. Use `onChange` for side effects like toggling dependent field visibility. */
export function FormCheckboxField(props: FormCheckboxFieldProps): ReactElement {
  const { form, name, label, onChange } = props;

  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => (
        <FormControlLabel
          control={
            <Checkbox
              checked={!!field.state.value}
              onChange={(e) => {
                field.handleChange(e.target.checked);
                onChange?.(e.target.checked);
              }}
            />
          }
          label={label}
        />
      )}
    </form.Field>
  );
}
