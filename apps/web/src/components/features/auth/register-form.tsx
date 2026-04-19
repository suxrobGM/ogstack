"use client";

import type { ReactElement } from "react";
import { Button, Stack } from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { client } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants";
import { registerSchema } from "./schema";
import type { RegisterPayload } from "./types";

interface RegisterResponse {
  message: string;
  email: string;
}

export function RegisterForm(): ReactElement {
  const router = useRouter();

  const mutation = useApiMutation<RegisterResponse, RegisterPayload>(
    (values) => client.api.auth.register.post(values),
    {
      onSuccess: (data) => {
        router.push(
          `${ROUTES.verifyEmailSent}?email=${encodeURIComponent(data.email)}` as Parameters<
            typeof router.push
          >[0],
        );
      },
      errorMessage: "Registration failed",
    },
  );

  const form = useForm({
    defaultValues: { firstName: "", lastName: "", email: "", password: "" },
    validators: { onSubmit: registerSchema },
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
      <Stack spacing={2.5}>
        <Stack direction="row" spacing={2}>
          <FormTextField
            form={form}
            name="firstName"
            label="First name"
            autoComplete="given-name"
            autoFocus
          />
          <FormTextField form={form} name="lastName" label="Last name" autoComplete="family-name" />
        </Stack>
        <FormTextField form={form} name="email" label="Email" type="email" autoComplete="email" />
        <FormTextField
          form={form}
          name="password"
          label="Password"
          type="password"
          autoComplete="new-password"
        />
        <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating account..." : "Create account"}
        </Button>
      </Stack>
    </form>
  );
}
