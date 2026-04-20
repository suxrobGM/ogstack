"use client";

import type { ReactElement } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { FrameworkSnippetTabs } from "@/components/ui/display/framework-snippet-tabs";
import { MonoId } from "@/components/ui/display/mono-id";
import { SectionHeader } from "@/components/ui/layout/section-header";
import type { Project } from "@/types/api";
import { buildFrameworkSnippets } from "@/utils/framework-snippets";
import { buildOgImageUrl } from "@/utils/integration-snippet";

interface ProjectIntegrationProps {
  project: Project;
}

export function ProjectIntegration(props: ProjectIntegrationProps): ReactElement {
  const { project } = props;

  const ogUrl = buildOgImageUrl(project.publicId, {
    url: "https://yoursite.com/page",
    template: "editorial",
  });

  const snippets = buildFrameworkSnippets({ kind: "og", ogUrl });

  return (
    <Box>
      <SectionHeader
        title="Integration"
        description="Drop the OG image into any framework. Pick yours below - the public ID and template are pre-filled."
      />
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="body2Muted">Public ID:</Typography>
          <MonoId id={project.publicId} copyable />
        </Stack>
        <FrameworkSnippetTabs snippets={snippets} />
      </Stack>
    </Box>
  );
}
