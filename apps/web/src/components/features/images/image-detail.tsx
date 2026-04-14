"use client";

import { useState, type ReactElement } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, Button, Grid, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlatformPreviewCard } from "@/components/features/audit/platform-preview-card";
import { PLATFORMS } from "@/components/features/audit/platforms";
import { PageHeader } from "@/components/ui/layout/page-header";
import { Surface } from "@/components/ui/layout/surface";
import { useApiMutation } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers/confirm-provider";
import type { AuditPreviewMetadata, ImageItem } from "@/types/api";
import { ImageEditForm } from "./image-edit-form";
import { ImageIntegrationSnippet } from "./image-integration-snippet";
import { ImageMetadata } from "./image-metadata";
import { ImagePreview } from "./image-preview";

interface ImageDetailProps {
  image: ImageItem;
}

export function ImageDetail(props: ImageDetailProps): ReactElement {
  const { image } = props;
  const router = useRouter();
  const confirm = useConfirm();
  const [mode, setMode] = useState<"view" | "edit">("view");

  const deleteMutation = useApiMutation(() => client.api.images({ id: image.id }).delete(), {
    successMessage: "Image deleted.",
    invalidateKeys: [queryKeys.images.all],
    onSuccess: () => router.push("/images"),
  });

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete image?",
      description:
        "This removes the image from your history. The cached asset may still be served until expiry.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (confirmed) deleteMutation.mutate();
  };

  const title = image.title ?? image.sourceUrl ?? "Untitled";
  const previewMetadata: AuditPreviewMetadata = {
    title: image.title ?? null,
    description: image.description ?? null,
    image: image.cdnUrl ?? image.imageUrl,
    siteName: null,
    url: image.sourceUrl ?? "",
    favicon: image.faviconUrl ?? null,
    twitterCardType: "summary_large_image",
  };

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <IconButton
          component={Link}
          href={{ pathname: "/images" }}
          size="small"
          aria-label="Back to images"
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <PageHeader title={title} description={image.sourceUrl ?? undefined} />
        </Box>
      </Stack>

      <Surface>
        <Stack spacing={3}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Image
            </Typography>
            {mode === "view" && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => setMode("edit")}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 7 }}>
              <ImagePreview image={image} alt={title} />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }}>
              {mode === "view" ? (
                <ImageMetadata image={image} />
              ) : (
                <ImageEditForm
                  image={image}
                  onCancel={() => setMode("view")}
                  onSuccess={() => setMode("view")}
                />
              )}
            </Grid>
          </Grid>
          {mode === "view" && (
            <Stack direction="row" spacing={1} sx={{ justifyContent: "flex-end" }}>
              <Button
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
                loading={deleteMutation.isPending}
              >
                Delete
              </Button>
              <Button
                startIcon={<OpenInNewIcon />}
                href={image.cdnUrl ?? image.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </Button>
            </Stack>
          )}
        </Stack>
      </Surface>

      <Surface>
        <ImageIntegrationSnippet image={image} />
      </Surface>

      <Surface>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">Platform previews</Typography>
            <Typography variant="body2Muted">
              How this image appears when shared across networks.
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {PLATFORMS.map((platform) => (
              <Grid key={platform.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <PlatformPreviewCard platform={platform} metadata={previewMetadata} />
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Surface>
    </Stack>
  );
}
