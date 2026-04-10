"use client";

import { useEffect, type ReactElement } from "react";
import { Alert, Button, CircularProgress, Link, Stack } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { client } from "@/lib/api";
import { ROUTES } from "@/lib/constants";
import type { VerifyEmailPayload } from "./types";

export function VerifyEmailHandler(): ReactElement {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const verifyMutation = useApiMutation<{ message: string }, VerifyEmailPayload>((values) =>
    client.api.auth["verify-email"].post(values),
  );

  useEffect(() => {
    if (token) {
      verifyMutation.mutate({ token });
    }
  }, [token]);

  if (!token) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        Invalid or missing verification token. Please request a new verification link.
      </Alert>
    );
  }

  if (verifyMutation.isPending) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", py: 2 }}>
        <CircularProgress size={32} />
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Verifying your email address...
        </Alert>
      </Stack>
    );
  }

  if (verifyMutation.isSuccess) {
    return (
      <Stack spacing={2}>
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          Your email has been verified. You can now sign in.
        </Alert>
        <Link href={ROUTES.login} underline="none">
          <Button variant="contained" size="large" fullWidth>
            Sign in
          </Button>
        </Link>
      </Stack>
    );
  }

  if (verifyMutation.isError) {
    return (
      <Alert severity="error" sx={{ borderRadius: 2 }}>
        {verifyMutation.error?.message ?? "Verification failed. The link may be expired."}
      </Alert>
    );
  }

  return <></>;
}
