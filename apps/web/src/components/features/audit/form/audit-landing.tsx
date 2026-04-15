"use client";

import type { ReactElement } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { AuditForm } from "./audit-form";

export function AuditLanding(): ReactElement {
  const router = useRouter();
  return (
    <AuditForm
      autoFocus
      onSuccess={(report) => {
        router.push(`/audit/${report.id}` as Route);
      }}
    />
  );
}
