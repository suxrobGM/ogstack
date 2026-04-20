"use client";

import { useState, type ReactElement } from "react";
import { Alert, Button, Link, Stack } from "@mui/material";
import { isAdminRole } from "@ogstack/shared";
import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { FormTextField } from "@/components/ui/form";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { useRecaptcha } from "@/hooks/use-recaptcha";
import { client } from "@/lib/api/client";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import type { AuthResponse } from "@/types/api";
import { loginSchema } from "./schema";
import type { LoginPayload } from "./types";

function isUnverifiedEmailError(message?: string | null): boolean {
  return !!message && /verify your email/i.test(message);
}

export function LoginForm(): ReactElement {
  const router = useRouter();
  const { setUser } = useAuth();
  const { executeRecaptcha } = useRecaptcha();
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const mutation = useApiMutation<AuthResponse, LoginPayload>(
    (values) => client.api.auth.login.post(values),
    {
      onSuccess: (data) => {
        setUser(data.user);
        router.push(isAdminRole(data.user.role) ? ROUTES.adminOverview : ROUTES.overview);
      },
      errorMessage: "Invalid email or password",
    },
  );

  const form = useForm({
    defaultValues: { email: "", password: "", recaptchaToken: "" },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setUnverifiedEmail(null);
      const recaptchaToken = await executeRecaptcha("login");

      mutation.mutate(
        { ...value, recaptchaToken },
        {
          onError: (error) => {
            if (isUnverifiedEmailError(error.message)) {
              setUnverifiedEmail(value.email);
            }
          },
        },
      );
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
        {unverifiedEmail && (
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Please verify your email before signing in.{" "}
            <Link
              href={`${ROUTES.verifyEmailSent}?email=${encodeURIComponent(unverifiedEmail)}`}
              underline="hover"
            >
              Resend verification email
            </Link>
            .
          </Alert>
        )}
        <FormTextField
          form={form}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          autoFocus
        />
        <FormTextField
          form={form}
          name="password"
          label="Password"
          type="password"
          autoComplete="current-password"
        />
        <Link
          href={ROUTES.forgotPassword}
          variant="body2Muted"
          underline="hover"
          sx={{ alignSelf: "flex-end", mt: -1, color: "text.secondary" }}
        >
          Forgot password?
        </Link>
        <Button type="submit" variant="contained" size="large" disabled={mutation.isPending}>
          {mutation.isPending ? "Signing in..." : "Sign in"}
        </Button>
      </Stack>
    </form>
  );
}
