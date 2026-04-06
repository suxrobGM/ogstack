import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { getServerClient } from "@/lib/api-server";
import { ProjectsFeature } from "@/components/features/projects/projects-feature";

export default async function ProjectsPage(): Promise<ReactElement> {
  const client = await getServerClient({ auth: true });
  const { data: user } = await client.api.users.me.get();

  if (!user) {
    redirect("/login");
  }

  return <ProjectsFeature />;
}
