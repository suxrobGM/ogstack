import type { ReactElement } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";
import { ForgotPasswordForm } from "@/components/features/auth/forgot-password-form";
import { ROUTES } from "@/lib/constants";

export default function ForgotPasswordPage(): ReactElement {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a reset link"
      footer={{ text: "Remember your password?", linkText: "Sign in", href: ROUTES.login }}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
