"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Stack } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useSearchParams } from "next/navigation";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useToast } from "@/hooks/use-toast";
import { client } from "@/lib/api";
import { resetPasswordSchema } from "./schemas";
import type { ResetPasswordApiPayload } from "./types";

export function ResetPasswordForm(): ReactElement {
  const toast = useToast();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [success, setSuccess] = useState(false);

  const mutation = useApiMutation<{ message: string }, ResetPasswordApiPayload>(
    (values) => client.api.auth["reset-password"].post(values),
    { onSuccess: () => setSuccess(true) },
  );

  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validators: { onSubmit: resetPasswordSchema },
    onSubmit: async ({ value }) => {
      if (!token) {
        toast.error("Invalid reset link — no token found");
        return;
      }
      mutation.mutate({ token, password: value.password });
    },
  });

  if (!token) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Invalid or missing reset token. Please request a new reset link.
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert severity="success" sx={{ borderRadius: 2 }}>
        Password reset successfully. You can now sign in with your new password.
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
          name="password"
          label="New password"
          type="password"
          autoComplete="new-password"
          autoFocus
        />
        <FormTextField
          form={form}
          name="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
          {mutation.isPending ? "Resetting..." : "Reset password"}
        </Button>
      </Stack>
    </form>
  );
}
