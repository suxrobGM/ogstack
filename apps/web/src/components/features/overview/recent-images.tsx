"use client";

import type { ReactElement } from "react";
import ImageIcon from "@mui/icons-material/Image";
import { Box, Button, Grid, Link, Stack, Typography } from "@mui/material";
import Image from "next/image";
import { EmptyState } from "@/components/ui/data/empty-state";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import { radii, surfaces } from "@/theme";
import { motion } from "@/theme/tokens";
import type { ImageItem } from "@/types/api";

interface RecentImagesProps {
  images: ImageItem[];
}

export function RecentImages(props: RecentImagesProps): ReactElement {
  const { images } = props;

  return (
    <Stack spacing={2.5}>
      <SectionHeader
        title="Recent images"
        actions={
          images.length > 0 ? (
            <Link href={ROUTES.images} variant="body2" underline="hover">
              View all
            </Link>
          ) : undefined
        }
      />
      {images.length === 0 ? (
        <EmptyState
          icon={<ImageIcon />}
          title="No images yet"
          description="Generate your first OG image from the playground."
          action={
            <Button href={ROUTES.playground} variant="contained">
              Open playground
            </Button>
          }
        />
      ) : (
        <Grid container spacing={2}>
          {images.slice(0, 6).map((image) => (
            <Grid key={image.id} size={{ xs: 6 }}>
              <Link
                href={image.projectId ? ROUTES.projectDetail(image.projectId) : ROUTES.images}
                sx={{ textDecoration: "none", display: "block" }}
              >
                <Surface
                  padding={0}
                  sx={{
                    overflow: "hidden",
                    transition: motion.standard,
                    "&:hover": { transform: "translateY(-2px)" },
                  }}
                >
                  <Box
                    sx={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1200 / 630",
                      backgroundColor: surfaces.elevated,
                      borderTopLeftRadius: `${radii.md}px`,
                      borderTopRightRadius: `${radii.md}px`,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={image.cdnUrl ?? image.imageUrl}
                      alt={image.title ?? "OG image"}
                      fill
                      sizes="(max-width: 600px) 50vw, 300px"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  </Box>
                  <Box sx={{ p: 1.5 }}>
                    <Typography variant="overlineMuted" sx={{ display: "block" }}>
                      {image.template?.name ?? "-"}
                    </Typography>
                    <Typography variant="body2" noWrap sx={{ mt: 0.5 }}>
                      {image.title ?? image.sourceUrl}
                    </Typography>
                  </Box>
                </Surface>
              </Link>
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
