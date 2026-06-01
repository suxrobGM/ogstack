import type { ReactElement } from "react";
import { ProfileContent } from "@/components/features/settings/profile-content";
import { getCurrentUser } from "@/lib/api/queries";

export default async function ProfilePage(): Promise<ReactElement> {
  const user = await getCurrentUser();

  return <ProfileContent user={user!} />;
}
