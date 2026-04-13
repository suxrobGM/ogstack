import { Suspense, type PropsWithChildren, type ReactElement } from "react";
import { isAdminRole } from "@ogstack/shared";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getServerClient } from "@/lib/api/server";
import { ROUTES } from "@/lib/constants";
import { AuthProvider } from "@/providers/auth-provider";
import { ConfirmProvider } from "@/providers/confirm-provider";

async function getUser() {
  const client = await getServerClient();
  const { data, error } = await client.api.users.me.get();
  if (error) return null;
  return data;
}

async function AdminAuthenticatedShell(props: PropsWithChildren): Promise<ReactElement> {
  const { children } = props;
  const user = await getUser();

  if (!user) {
    redirect(ROUTES.login);
  }

  if (!isAdminRole(user.role)) {
    redirect(ROUTES.overview);
  }

  return (
    <AuthProvider initialUser={user}>
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
