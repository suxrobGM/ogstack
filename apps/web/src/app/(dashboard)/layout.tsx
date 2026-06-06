import { Suspense, type PropsWithChildren, type ReactElement } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/api/queries";
import { AuthProvider } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
import { ROUTES } from "@/lib/constants";
import { ConfirmProvider } from "@/providers/confirm-provider";

async function AuthenticatedShell(props: PropsWithChildren): Promise<ReactElement> {
  const { children } = props;
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  return (
    <AuthProvider user={user}>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}

export default function DashboardLayout(props: PropsWithChildren): ReactElement {
  const { children } = props;
  return (
    <ConfirmProvider>
      <Suspense>
        <AuthenticatedShell>{children}</AuthenticatedShell>
      </Suspense>
    </ConfirmProvider>
  );
}
