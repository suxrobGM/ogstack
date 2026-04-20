"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Stack } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { client } from "@/lib/api/client";
import { forgotPasswordSchema } from "./schema";
import type { ForgotPasswordPayload } from "./types";

export function ForgotPasswordForm(): ReactElement {
  const [sent, setSent] = useState(false);
  const { executeRecaptcha } = useRecaptcha();

  const mutation = useApiMutation<{ message: string }, ForgotPasswordPayload>(
    (values) => client.api.auth["forgot-password"].post(values),
    { onSuccess: () => setSent(true) },
  );

  const form = useForm({
    defaultValues: { email: "", recaptchaToken: "" },
    validators: { onSubmit: forgotPasswordSchema },
    onSubmit: async ({ value }) => {
      const recaptchaToken = await executeRecaptcha("forgot_password");
      mutation.mutate({ ...value, recaptchaToken });
    },
  });

  if (sent) {
    return (
      <Alert severity="success" sx={{ borderRadius: 2 }}>
        If an account exists with that email, we&apos;ve sent password reset instructions. Check
        your inbox.
      </Alert>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Stack spacing={2.5}>
        <FormTextField
          form={form}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
        />
        <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
          {mutation.isPending ? "Sending..." : "Send reset link"}
        </Button>
      </Stack>
    </form>
  );
}
