import { Suspense, type ReactElement } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";
import { VerifyEmailHandler } from "@/components/features/auth/verify-email-handler";
import { ROUTES } from "@/lib/constants";

export default function VerifyEmailPage(): ReactElement {
  return (
    <AuthCard
      title="Email verification"
      footer={{ text: "Back to", linkText: "Sign in", href: ROUTES.login }}
    >
      <Suspense>
        <VerifyEmailHandler />
      </Suspense>
    </AuthCard>
  );
}
