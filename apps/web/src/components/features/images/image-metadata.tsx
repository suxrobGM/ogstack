"use client";

import type { ReactElement, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { CodeBlock } from "@/components/ui/display/code-block";
import { CopyButton } from "@/components/ui/display/copy-button";
import type { ImageItem } from "@/types/api";
import { buildOgImageUrl, buildOgMetaTag } from "@/utils/og-image";

interface ImageMetadataProps {
  image: ImageItem;
}

export function ImageMetadata(props: ImageMetadataProps): ReactElement {
  const { image } = props;
  const snippet = buildIntegrationSnippet(image);
  const imageUrl = image.cdnUrl ?? image.imageUrl;

  return (
    <Stack spacing={1.5}>
      <MetaRow label="Source URL">
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            {image.sourceUrl ?? "—"}
          </Typography>
          {image.sourceUrl && <CopyButton text={image.sourceUrl} />}
        </Stack>
      </MetaRow>
      <MetaRow label="Image URL">
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            {imageUrl}
          </Typography>
          <CopyButton text={imageUrl} />
        </Stack>
      </MetaRow>
      <MetaRow label="Template">
        <Typography variant="body2">
          {image.template
            ? `${image.template.name} (${image.template.slug})`
            : (image.category ?? "—")}
        </Typography>
      </MetaRow>
      <MetaRow label="Project">
        <Typography variant="body2">{image.projectName ?? "—"}</Typography>
      </MetaRow>
      <MetaRow label="Dimensions">
        <Typography variant="body2">
          {image.width} × {image.height}
        </Typography>
      </MetaRow>
      <MetaRow label="Format">
        <Typography variant="body2">{image.format}</Typography>
      </MetaRow>
      {image.generationMs !== null && (
        <MetaRow label="Generation time">
          <Typography variant="body2">{image.generationMs} ms</Typography>
        </MetaRow>
      )}
      <MetaRow label="Serve count">
        <Typography variant="body2">{image.serveCount}</Typography>
      </MetaRow>
      <MetaRow label="Created">
        <Typography variant="body2">{new Date(image.createdAt).toLocaleString()}</Typography>
      </MetaRow>
      {image.description && (
        <MetaRow label="Description">
          <Typography variant="body2">{image.description}</Typography>
        </MetaRow>
      )}
      {snippet && <IntegrationSnippet code={snippet} />}
    </Stack>
  );
}

function IntegrationSnippet(props: { code: string }): ReactElement {
  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      <Typography
        variant="captionMuted"
        sx={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        Integration
      </Typography>
      <Typography variant="body2Muted">
        Drop this meta tag into the page&apos;s &lt;head&gt; to serve this image.
      </Typography>
      <CodeBlock code={props.code} language="html" />
    </Stack>
  );
}

function MetaRow(props: { label: string; children: ReactNode }): ReactElement {
  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: "flex-start" }}>
      <Typography
        variant="captionMuted"
        sx={{ minWidth: 140, textTransform: "uppercase", letterSpacing: "0.05em" }}
      >
        {props.label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{props.children}</Box>
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
    params.set("aiGenerated", "true");
  } else if (image.template?.slug) {
    params.set("template", image.template.slug);
  }
  return buildOgMetaTag(buildOgImageUrl(image.publicProjectId, params));
}
