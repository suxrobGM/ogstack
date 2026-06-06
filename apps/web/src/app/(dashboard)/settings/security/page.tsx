import type { ReactElement } from "react";
import { getCurrentUser } from "@/api/queries";
import { SecurityContent } from "@/components/features/settings/security-content";

export default async function SecurityPage(): Promise<ReactElement> {
  const user = await getCurrentUser();

  return <SecurityContent user={user!} />;
}
