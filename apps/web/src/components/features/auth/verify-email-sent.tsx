"use client";

import { type ReactElement } from "react";
import { Alert, Button, Stack, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { client } from "@/lib/api/client";

export function VerifyEmailSent(): ReactElement {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const resendMutation = useApiMutation<{ message: string }, { email: string }>(
    (values) => client.api.auth["resend-verification"].post(values),
    { errorMessage: "Could not resend verification email" },
  );

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2">
        We sent a verification link to{" "}
        <Typography component="span" variant="body2" sx={{ fontWeight: 600 }}>
          {email || "your email address"}
        </Typography>
        . Click the link to activate your account, then sign in.
      </Typography>

      <Typography variant="body2Muted">
        Didn&apos;t get the email? Check your spam folder or request a new link.
      </Typography>

      {resendMutation.isSuccess && (
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          If an unverified account exists for that email, a new verification link has been sent.
        </Alert>
      )}

      <Button
        variant="outlined"
        size="large"
        disabled={!email || resendMutation.isPending}
        onClick={() => resendMutation.mutate({ email })}
      >
        {resendMutation.isPending ? "Sending…" : "Resend verification email"}
      </Button>
    </Stack>
  );
}
