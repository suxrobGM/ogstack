"use client";

import type { ReactElement } from "react";
import { Alert } from "@mui/material";
import { useSearchParams } from "next/navigation";

export function OAuthError(): ReactElement | null {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  if (!error) return null;

  return (
    <Alert severity="error" sx={{ borderRadius: 2 }}>
      {error}
    </Alert>
  );
}
