import type { ReactElement } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";
import { ResetPasswordForm } from "@/components/features/auth/reset-password-form";
import { ROUTES } from "@/lib/constants";

export default function ResetPasswordPage(): ReactElement {
  return (
    <AuthCard
      title="Set a new password"
      description="Choose a strong password for your account"
      footer={{ text: "Back to", linkText: "Sign in", href: ROUTES.login }}
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
