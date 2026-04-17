"use client";

import type { ReactElement } from "react";
import { Stack, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";
import type { ImageItem } from "@/types/api";
import { buildOgImageUrl, buildOgMetaTag } from "@/utils/og-image";

interface ImageIntegrationSnippetProps {
  image: ImageItem;
}

export function ImageIntegrationSnippet(props: ImageIntegrationSnippetProps): ReactElement | null {
  const snippet = buildIntegrationSnippet(props.image);
  if (!snippet) return null;

  return (
    <Stack spacing={2}>
      <Stack spacing={0.5}>
        <Typography variant="h6">Integration</Typography>
        <Typography variant="body2Muted">
          Drop this meta tag into the page&apos;s &lt;head&gt; to serve this image.
        </Typography>
      </Stack>
      <CodeBlock code={snippet} language="html" />
    </Stack>
  );
}

function buildIntegrationSnippet(image: ImageItem): string | null {
  if (!image.publicProjectId) {
    return null;
  }
  const sourceUrl = image.sourceUrl ?? "https://yoursite.com/page";
  const params = new URLSearchParams({ url: sourceUrl });

  if (image.aiModel) {
    params.set("ai", "true");
  } else if (image.template?.slug) {
    params.set("template", image.template.slug);
  }
  return buildOgMetaTag(buildOgImageUrl(image.publicProjectId, params));
}
