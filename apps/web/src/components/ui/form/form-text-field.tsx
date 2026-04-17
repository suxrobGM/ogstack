"use client";

import type { ReactElement } from "react";
import { TextField, type TextFieldProps } from "@mui/material";
import type { AnyFieldApi } from "@tanstack/react-form";
import type { AnyReactForm } from "./types";

type FormTextFieldProps = {
  form: AnyReactForm;
  name: string;
  transform?: (value: string) => string;
  /** Show a live `len / charLimit` counter in helperText and flag over-limit as error. Also sets the input's maxLength. */
  charLimit?: number;
} & Omit<TextFieldProps, "value" | "onChange" | "onBlur" | "error" | "helperText" | "name">;

export function FormTextField(props: FormTextFieldProps): ReactElement {
  const { form, name, transform, charLimit, slotProps, ...textFieldProps } = props;

  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => {
        const value = (field.state.value as string | undefined) ?? "";
        const validationError =
          field.state.meta.errors[0]?.message ?? field.state.meta.errors[0]?.toString();

        const overLimit = charLimit && value.length > charLimit;
        const helperText = charLimit
          ? `${value.length} / ${charLimit} characters`
          : validationError;

        const mergedSlotProps = charLimit
          ? { ...slotProps, htmlInput: { maxLength: charLimit, ...slotProps?.htmlInput } }
          : slotProps;

        return (
          <TextField
            fullWidth
            value={value}
            onChange={(e) => {
              const next = transform ? transform(e.target.value) : e.target.value;
              field.handleChange(next);
            }}
            onBlur={field.handleBlur}
            error={overLimit || field.state.meta.errors.length > 0}
            helperText={helperText}
            slotProps={mergedSlotProps}
            {...textFieldProps}
          />
        );
      }}
    </form.Field>
  );
}
