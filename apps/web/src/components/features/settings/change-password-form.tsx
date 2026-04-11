"use client";

import type { ReactElement } from "react";
import { Box, Button, Stack } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { client } from "@/lib/api";
import { changePasswordSchema } from "./schema";

export function ChangePasswordForm(): ReactElement {
  const mutation = useApiMutation<
    { message: string },
    { currentPassword: string; newPassword: string; confirmPassword: string }
  >((values) => client.api.users.me.password.post(values), {
    successMessage: "Password changed successfully.",
    errorMessage: "Failed to change password.",
    onSuccess: () => {
      form.reset();
    },
  });

  const form = useForm({
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validators: { onSubmit: changePasswordSchema },
    onSubmit: async ({ value }) => {
      mutation.mutate(value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <Stack spacing={2.5} sx={{ maxWidth: 400 }}>
        <FormTextField
          form={form}
          name="currentPassword"
          label="Current password"
          type="password"
          autoComplete="current-password"
        />
        <FormTextField
          form={form}
          name="newPassword"
          label="New password"
          type="password"
          autoComplete="new-password"
        />
        <FormTextField
          form={form}
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
        />
        <Box>
          <Button type="submit" variant="contained" disabled={mutation.isPending}>
            {mutation.isPending ? "Changing..." : "Change password"}
          </Button>
        </Box>
      </Stack>
    </form>
  );
}
