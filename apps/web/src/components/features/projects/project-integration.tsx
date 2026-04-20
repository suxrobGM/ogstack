"use client";

import type { ReactElement } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";
import { MonoId } from "@/components/ui/display/mono-id";
import { SectionHeader } from "@/components/ui/layout/section-header";
import type { Project } from "@/types/api";
import { buildOgMetaTag } from "@/utils/integration-snippet";

interface ProjectIntegrationProps {
  project: Project;
}

export function ProjectIntegration(props: ProjectIntegrationProps): ReactElement {
  const { project } = props;

  const metaTag = buildOgMetaTag(project.publicId, {
    url: "https://yoursite.com/page",
    template: "editorial",
  });

  return (
    <Box>
      <SectionHeader
        title="Integration"
        description="Add this meta tag to your HTML to generate OG images for any page."
      />
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Typography variant="body2Muted">Public ID:</Typography>
          <MonoId id={project.publicId} copyable />
        </Stack>
        <CodeBlock code={metaTag} language="html" />
      </Stack>
    </Box>
  );
}
