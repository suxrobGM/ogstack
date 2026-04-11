import type { ReactElement } from "react";
import { ProfileContent } from "@/components/features/settings/profile-content";
import { getServerClient } from "@/lib/api-server";

export default async function ProfilePage(): Promise<ReactElement> {
  const client = await getServerClient();
  const { data: user } = await client.api.users.me.get();

  return <ProfileContent initialUser={user!} />;
}
