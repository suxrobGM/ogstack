"use client";

import type { ReactElement } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { AnyReactForm } from "./types";

type FormDateFieldProps = {
  form: AnyReactForm;
  name: string;
  /** Earliest selectable date (YYYY-MM-DD). */
  min?: string;
  /** Latest selectable date (YYYY-MM-DD). */
  max?: string;
} & Omit<
  TextFieldProps,
  "value" | "onChange" | "onBlur" | "error" | "helperText" | "name" | "type"
>;

/** A date input field integrated with TanStack Form. */
export function FormDateField(props: FormDateFieldProps): ReactElement {
  const { form, name, min, max, ...textFieldProps } = props;

  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => (
        <TextField
          type="date"
          fullWidth
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          error={field.state.meta.errors.length > 0}
          helperText={
            (field.state.meta.errors[0] as { message?: string })?.message ??
            field.state.meta.errors[0]?.toString()
          }
          slotProps={{
            htmlInput: { min, max },
            inputLabel: { shrink: true },
          }}
          {...textFieldProps}
        />
      )}
    </form.Field>
  );
}
