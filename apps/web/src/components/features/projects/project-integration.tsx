"use client";

import type { ReactElement } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";
import { MonoId } from "@/components/ui/display/mono-id";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { API_BASE_URL } from "@/lib/constants";
import type { Project } from "@/types/api";

interface ProjectIntegrationProps {
  project: Project;
}

export function ProjectIntegration(props: ProjectIntegrationProps): ReactElement {
  const { project } = props;

  const ogEndpoint = API_BASE_URL.replace("/api", "").replace(":4000", ":4000");
  const metaTag = `<meta property="og:image"\n  content="${ogEndpoint}/og/${project.publicId}?url=https://yoursite.com/page&template=gradient_dark" />`;

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
