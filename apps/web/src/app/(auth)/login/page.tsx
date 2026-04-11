import { Suspense, type ReactElement } from "react";
import { AuthCard } from "@/components/features/auth/auth-card";
import { LoginForm } from "@/components/features/auth/login-form";
import { OAuthButtons } from "@/components/features/auth/oauth-buttons";
import { OAuthError } from "@/components/features/auth/oauth-error";
import { ROUTES } from "@/lib/constants";

export default function LoginPage(): ReactElement {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your OGStack account"
      footer={{ text: "Don't have an account?", linkText: "Create one", href: ROUTES.register }}
    >
      <Suspense>
        <OAuthError />
      </Suspense>
      <OAuthButtons />
      <LoginForm />
    </AuthCard>
  );
}
