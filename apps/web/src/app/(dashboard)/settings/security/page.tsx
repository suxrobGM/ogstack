import type { ReactElement } from "react";
import { SecurityContent } from "@/components/features/settings/security-content";
import { getCurrentUser } from "@/lib/api/queries";

export default async function SecurityPage(): Promise<ReactElement> {
  const user = await getCurrentUser();

  return <SecurityContent user={user!} />;
}
