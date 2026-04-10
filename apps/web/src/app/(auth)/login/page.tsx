import type { ReactElement } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";
import { LoginForm } from "@/components/features/auth/login-form";
import { ROUTES } from "@/lib/constants";

export default function LoginPage(): ReactElement {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your OGStack account"
      footer={{ text: "Don't have an account?", linkText: "Create one", href: ROUTES.register }}
    >
      <LoginForm />
    </AuthCard>
  );
}
