import type { ReactElement } from "react";
import { getCurrentUser } from "@/api/queries";
import { ProfileContent } from "@/components/features/settings/profile-content";

export default async function ProfilePage(): Promise<ReactElement> {
  const user = await getCurrentUser();

  return <ProfileContent user={user!} />;
}
