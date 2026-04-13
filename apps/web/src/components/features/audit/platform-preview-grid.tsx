import type { ReactElement } from "react";
import { Grid } from "@mui/material";
import type { AuditPreviewMetadata } from "@/types/api";
import { PlatformPreviewCard } from "./platform-preview-card";
import { PLATFORMS } from "./platforms";

interface PlatformPreviewGridProps {
  metadata: AuditPreviewMetadata;
}

export function PlatformPreviewGrid(props: PlatformPreviewGridProps): ReactElement {
  const { metadata } = props;
  return (
    <Grid container spacing={3}>
      {PLATFORMS.map((platform) => (
        <Grid key={platform.id} size={{ xs: 12, sm: 6, md: 4 }}>
          <PlatformPreviewCard platform={platform} metadata={metadata} />
        </Grid>
      ))}
    </Grid>
  );
}
