import type { ReactElement } from "react";
import { Typography } from "@mui/material";
import { ApiKeyList } from "@/components/features/api-keys/api-key-list";
import { getServerClient } from "@/lib/api-server";

export default async function ApiKeysPage(): Promise<ReactElement> {
  const client = await getServerClient();

  // Get the user's first project to scope API keys
  const { data: projects } = await client.api.projects.get({ query: { page: 1, limit: 1 } });
  const project = projects?.items?.[0];

  if (!project) {
    return (
      <Typography sx={{ color: "text.secondary" }}>
        Create a project first to manage API keys.
      </Typography>
    );
  }

  const { data: keys } = await client.api
    .projects({ projectId: project.id, id: project.id })
    ["api-keys"].get();

  return <ApiKeyList projectId={project.id} initialData={keys} />;
}
