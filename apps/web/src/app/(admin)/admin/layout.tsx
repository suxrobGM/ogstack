import { Suspense, type PropsWithChildren, type ReactElement } from "react";
import { isAdminRole } from "@ogstack/shared";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getCurrentUser } from "@/lib/api/queries";
import { ROUTES } from "@/lib/constants";
import { AuthProvider } from "@/providers/auth-provider";
import { ConfirmProvider } from "@/providers/confirm-provider";

async function AdminAuthenticatedShell(props: PropsWithChildren): Promise<ReactElement> {
  const { children } = props;
  const user = await getCurrentUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  if (!isAdminRole(user.role)) {
    redirect(ROUTES.overview);
  }

  return (
    <AuthProvider user={user}>
      <AppShell variant="admin">{children}</AppShell>
    </AuthProvider>
  );
}

export default function AdminLayout(props: PropsWithChildren): ReactElement {
  const { children } = props;
  return (
    <ConfirmProvider>
      <Suspense>
        <AdminAuthenticatedShell>{children}</AdminAuthenticatedShell>
      </Suspense>
    </ConfirmProvider>
  );
}
