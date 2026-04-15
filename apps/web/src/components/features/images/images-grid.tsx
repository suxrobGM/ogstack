"use client";

import type { ReactElement } from "react";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import { Grid, Skeleton } from "@mui/material";
import { EmptyState } from "@/components/ui/data/empty-state";
import { radii } from "@/theme";
import type { ImageItem } from "@/types/api";
import { ImageCard } from "./image-card";

interface ImagesGridProps {
  items: ImageItem[];
  loading: boolean;
  hasFilters: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

const SKELETON_COUNT = 6;

export function ImagesGrid(props: ImagesGridProps): ReactElement {
  const { items, loading, hasFilters, selectedIds, onToggleSelect } = props;

  if (loading) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skeleton
              variant="rounded"
              sx={{ width: "100%", aspectRatio: "1200 / 630", borderRadius: `${radii.sm}px` }}
            />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<PhotoLibraryIcon sx={{ fontSize: 48 }} />}
        title="No images found"
        description={
          hasFilters
            ? "No images match your filters. Try clearing them."
            : "Generate your first image from the Playground."
        }
      />
    );
  }

  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ImageCard
            item={item}
            selected={selectedIds.has(item.id)}
            onToggleSelect={() => onToggleSelect(item.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
