import { Suspense, type PropsWithChildren, type ReactElement } from "react";
import { isAdminRole } from "@ogstack/shared";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/admin-shell";
import { getServerClient } from "@/lib/api/server";
import { ROUTES } from "@/lib/constants";
import { AuthProvider } from "@/providers/auth-provider";
import { ConfirmProvider } from "@/providers/confirm-provider";
import { QueryProvider } from "@/providers/query-provider";

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
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}

export default function AdminLayout(props: PropsWithChildren): ReactElement {
  const { children } = props;
  return (
    <QueryProvider>
      <ConfirmProvider>
        <Suspense>
          <AdminAuthenticatedShell>{children}</AdminAuthenticatedShell>
        </Suspense>
      </ConfirmProvider>
    </QueryProvider>
  );
}
