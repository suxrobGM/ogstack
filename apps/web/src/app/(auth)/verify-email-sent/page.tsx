import type { ReactElement } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";
import { VerifyEmailSent } from "@/components/features/auth/verify-email-sent";
import { ROUTES } from "@/lib/constants";

export default function VerifyEmailSentPage(): ReactElement {
  return (
    <AuthCard
      title="Check your email"
      description="We just sent you a link to verify your email address."
      footer={{ text: "Back to", linkText: "Sign in", href: ROUTES.login }}
    >
      <VerifyEmailSent />
    </AuthCard>
  );
}
