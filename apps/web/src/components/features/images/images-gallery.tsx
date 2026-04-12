"use client";

import { useState, type ReactElement } from "react";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { EmptyState } from "@/components/ui/data/empty-state";
import { Pagination } from "@/components/ui/data/pagination";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiQuery, useDebouncedValue } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { line, motion, radii, shadows, surfaces } from "@/theme";
import type { ImageItem, ImageListResponse, Project } from "@/types/api";
import { ImageDetailDialog } from "./image-detail-dialog";
import { TEMPLATE_CATEGORIES, type TemplateCategoryValue } from "./schema";

interface ImagesGalleryProps {
  initialData: ImageListResponse | null;
  projects: Project[];
}

const PAGE_SIZE = 24;

export function ImagesGallery(props: ImagesGalleryProps): ReactElement {
  const { initialData, projects } = props;

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [category, setCategory] = useState<TemplateCategoryValue | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<ImageItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const hasFilters = Boolean(debouncedSearch || projectId || category || from || to);

  const { data, isLoading } = useApiQuery<ImageListResponse>(
    queryKeys.images.list({
      page,
      search: debouncedSearch,
      projectId,
      category,
      from,
      to,
    }),
    () =>
      client.api.images.get({
        query: {
          page,
          limit: PAGE_SIZE,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(projectId && { projectId }),
          ...(category && { category }),
          ...(from && { from: new Date(from).toISOString() }),
          ...(to && { to: new Date(to).toISOString() }),
        },
      }),
    {
      initialData: !hasFilters && page === 1 ? (initialData ?? undefined) : undefined,
      errorMessage: "Failed to load images.",
    },
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const resetPage = () => setPage(1);

  const clearFilters = () => {
    setSearch("");
    setProjectId("");
    setCategory("");
    setFrom("");
    setTo("");
    resetPage();
  };

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Generated Images"
        description="Every OG image you or your API has generated."
      />

      <Stack direction="row" spacing={2} sx={{ flexWrap: "wrap", gap: 2 }}>
        <TextField
          placeholder="Search URL or title..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: 240 }}
        />
        <TextField
          select
          size="small"
          label="Project"
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            resetPage();
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All projects</MenuItem>
          {projects.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Category"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value as TemplateCategoryValue | "");
            resetPage();
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All categories</MenuItem>
          {TEMPLATE_CATEGORIES.map((c) => (
            <MenuItem key={c} value={c}>
              {c.charAt(0) + c.slice(1).toLowerCase()}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          type="date"
          size="small"
          label="From"
          value={from}
          onChange={(e) => {
            setFrom(e.target.value);
            resetPage();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          type="date"
          size="small"
          label="To"
          value={to}
          onChange={(e) => {
            setTo(e.target.value);
            resetPage();
          }}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        {hasFilters && (
          <Button size="small" onClick={clearFilters}>
            Clear filters
          </Button>
        )}
      </Stack>

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box
                sx={{
                  width: "100%",
                  aspectRatio: "1200 / 630",
                  backgroundColor: surfaces.elevated,
                  borderRadius: `${radii.sm}px`,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<PhotoLibraryIcon sx={{ fontSize: 48 }} />}
          title="No images found"
          description={
            hasFilters
              ? "No images match your filters. Try clearing them."
              : "Generate your first image from the Playground."
          }
        />
      ) : (
        <Grid container spacing={2}>
          {items.map((item) => (
            <Grid key={item.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Box
                onClick={() => setSelected(item)}
                sx={{
                  cursor: "pointer",
                  borderRadius: `${radii.sm}px`,
                  border: `1px solid ${line.border}`,
                  backgroundColor: surfaces.card,
                  overflow: "hidden",
                  transition: `all ${motion.fast}`,
                  "&:hover": { boxShadow: shadows.md },
                }}
              >
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "1200 / 630",
                    overflow: "hidden",
                  }}
                >
                  <Image
                    src={item.cdnUrl ?? item.imageUrl}
                    alt={item.title ?? item.sourceUrl ?? "OG image"}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                </Box>
                <Box sx={{ px: 1.5, py: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.title ?? item.sourceUrl ?? "Untitled"}
                  </Typography>
                  <Typography
                    variant="captionMuted"
                    sx={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.template?.name ?? item.category ?? "—"}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      <ImageDetailDialog image={selected} onClose={() => setSelected(null)} />
    </Stack>
  );
}
