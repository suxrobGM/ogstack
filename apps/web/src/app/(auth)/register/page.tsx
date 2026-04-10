import type { ReactElement } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";
import { RegisterForm } from "@/components/features/auth/register-form";
import { ROUTES } from "@/lib/constants";

export default function RegisterPage(): ReactElement {
  return (
    <AuthCard
      title="Create your account"
      description="Start generating beautiful OG images in minutes"
      footer={{ text: "Already have an account?", linkText: "Sign in", href: ROUTES.login }}
    >
      <RegisterForm />
    </AuthCard>
  );
}
