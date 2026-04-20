"use client";

import type { ReactElement, ReactNode } from "react";
import DashboardCustomizeIcon from "@mui/icons-material/DashboardCustomize";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { aiModelLabel } from "@ogstack/shared";
import { AiChip } from "@/components/ui/display/ai-chip";
import { CopyButton } from "@/components/ui/display/copy-button";
import type { ImageItem } from "@/types/api";

interface ImageMetadataProps {
  image: ImageItem;
}

export function ImageMetadata(props: ImageMetadataProps): ReactElement {
  const { image } = props;
  const imageUrl = image.cdnUrl ?? image.imageUrl;

  return (
    <Stack spacing={1.5}>
      {image.title && (
        <MetaRow label="Title">
          <Typography variant="body2">{image.title}</Typography>
        </MetaRow>
      )}
      <MetaRow label="Source URL">
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
            {image.sourceUrl ?? "-"}
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
      <MetaRow label="Generation">
        <GenerationChip image={image} />
      </MetaRow>
      {!image.aiModel && (
        <MetaRow label="Template">
          <Typography variant="body2">
            {image.template
              ? `${image.template.name} (${image.template.slug})`
              : (image.category ?? "-")}
          </Typography>
        </MetaRow>
      )}
      <MetaRow label="Project">
        <Typography variant="body2">{image.projectName ?? "-"}</Typography>
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
    </Stack>
  );
}

function GenerationChip(props: { image: ImageItem }): ReactElement {
  const { image } = props;
  const label = aiModelLabel(image.aiModel);
  if (label) {
    return <AiChip label={`AI · ${label}`} />;
  }

  return (
    <Chip
      size="small"
      variant="outlined"
      icon={<DashboardCustomizeIcon fontSize="small" />}
      label={`Template${image.template ? ` · ${image.template.name}` : ""}`}
    />
  );
}

function MetaRow(props: { label: string; children: ReactNode }): ReactElement {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.5, sm: 2 }}
      sx={{ alignItems: { xs: "stretch", sm: "flex-start" } }}
    >
      <Typography
        variant="captionMuted"
        sx={{
          minWidth: { sm: 140 },
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {props.label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{props.children}</Box>
    </Stack>
  );
}
