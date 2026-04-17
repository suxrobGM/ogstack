"use client";

import { useState, type ReactElement } from "react";
import { Stack } from "@mui/material";
import { Pagination } from "@/components/ui/data/pagination";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiMutation, useApiQuery, useDebouncedValue } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers/confirm-provider";
import type { ImageListResponse, Project } from "@/types/api";
import { ImagesBulkActions } from "./images-bulk-actions";
import { ImagesFilters, type ImageGalleryFilters } from "./images-filters";
import { ImagesGrid } from "./images-grid";

interface ImagesGalleryProps {
  initialData: ImageListResponse | null;
  projects: Project[];
  projectId?: string;
  hideHeader?: boolean;
}

const PAGE_SIZE = 24;

const emptyFilters = (projectId?: string): ImageGalleryFilters => ({
  search: "",
  projectId: projectId ?? "",
  category: "",
  kind: "",
  from: "",
  to: "",
});

export function ImagesGallery(props: ImagesGalleryProps): ReactElement {
  const { initialData, projects, projectId: fixedProjectId, hideHeader = false } = props;
  const confirm = useConfirm();

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ImageGalleryFilters>(emptyFilters(fixedProjectId));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebouncedValue(filters.search, 400);

  const hasFilters = Boolean(
    debouncedSearch ||
    (!fixedProjectId && filters.projectId) ||
    filters.category ||
    filters.kind ||
    filters.from ||
    filters.to,
  );

  const { data, isLoading } = useApiQuery<ImageListResponse>(
    queryKeys.images.list({
      page,
      search: debouncedSearch,
      projectId: filters.projectId,
      category: filters.category,
      kind: filters.kind,
      from: filters.from,
      to: filters.to,
    }),
    () =>
      client.api.images.get({
        query: {
          page,
          limit: PAGE_SIZE,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filters.projectId && { projectId: filters.projectId }),
          ...(filters.category && { category: filters.category }),
          ...(filters.kind && { kind: filters.kind }),
          ...(filters.from && { from: new Date(filters.from) }),
          ...(filters.to && { to: new Date(filters.to) }),
        },
      }),
    {
      initialData: !hasFilters && page === 1 ? (initialData ?? undefined) : undefined,
      errorMessage: "Failed to load images.",
    },
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const bulkDeleteMutation = useApiMutation<{ success: boolean; deleted: number }, string[]>(
    (ids) => client.api.images.delete({ ids }),
    {
      successMessage: (res) => `Deleted ${res.deleted} image${res.deleted === 1 ? "" : "s"}.`,
      invalidateKeys: [queryKeys.images.all],
      onSuccess: () => setSelectedIds(new Set()),
      errorMessage: "Failed to delete images.",
    },
  );

  const updateFilter = <K extends keyof ImageGalleryFilters>(
    key: K,
    value: ImageGalleryFilters[K],
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(emptyFilters(fixedProjectId));
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allVisibleSelected = items.length > 0 && items.every((i) => selectedIds.has(i.id));
  const someVisibleSelected = items.some((i) => selectedIds.has(i.id));

  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) items.forEach((i) => next.delete(i.id));
      else items.forEach((i) => next.add(i.id));
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    const confirmed = await confirm({
      title: `Delete ${ids.length} image${ids.length === 1 ? "" : "s"}?`,
      description:
        "This removes the selected images from your history. Cached assets may still be served until expiry.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (confirmed) bulkDeleteMutation.mutate(ids);
  };

  return (
    <Stack spacing={3}>
      {!hideHeader && (
        <PageHeader
          title="Generated Images"
          description="Every OG image you or your API has generated."
        />
      )}

      <ImagesFilters
        filters={filters}
        onChange={updateFilter}
        onClear={clearFilters}
        showClear={hasFilters}
        projects={projects}
        showProjectFilter={!fixedProjectId}
      />

      {items.length > 0 && (
        <ImagesBulkActions
          allSelected={allVisibleSelected}
          someSelected={someVisibleSelected}
          selectedCount={selectedIds.size}
          onToggleAll={toggleSelectAllVisible}
          onDelete={handleBulkDelete}
          deleting={bulkDeleteMutation.isPending}
        />
      )}

      <ImagesGrid
        items={items}
        loading={isLoading}
        hasFilters={hasFilters}
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
      />

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </Stack>
  );
}
