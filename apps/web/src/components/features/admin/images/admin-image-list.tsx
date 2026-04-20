"use client";

import { useState, type ReactElement } from "react";
import { Stack } from "@mui/material";
import { DataTable } from "@/components/ui/data/data-table";
import { Pagination } from "@/components/ui/data/pagination";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiMutation, useApiQuery, useDebouncedValue } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers/confirm-provider";
import type { AdminImageItem, AdminImageListResponse, TemplateInfo } from "@/types/api";
import { AdminImageBulkBar } from "./admin-image-bulk-bar";
import { buildAdminImageColumns } from "./admin-image-columns";
import { AdminImageFiltersBar } from "./admin-image-filters";
import { useAdminImageFilters } from "./use-admin-image-filters";

interface AdminImageListProps {
  initialData?: AdminImageListResponse | null;
  initialUserId?: string;
  initialProjectId?: string;
}

export function AdminImageList(props: AdminImageListProps): ReactElement {
  const { initialData, initialUserId = "", initialProjectId = "" } = props;
  const confirm = useConfirm();

  const { filters, setFilter, hasActiveFilters } = useAdminImageFilters({
    userId: initialUserId,
    projectId: initialProjectId,
  });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const debouncedSearch = useDebouncedValue(filters.search, 400);

  const setFilterAndResetPage: typeof setFilter = (key, value) => {
    setFilter(key, value);
    setPage(1);
  };

  const { data: templatesData } = useApiQuery<TemplateInfo[]>(
    queryKeys.templates.list(),
    () => client.api.templates.get(),
    { errorMessage: "Failed to load templates." },
  );

  const { data, isLoading } = useApiQuery<AdminImageListResponse>(
    queryKeys.admin.imagesList({ page, ...filters, search: debouncedSearch }),
    () =>
      client.api.admin.images.get({
        query: {
          page,
          limit: 20,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(filters.userId && { userId: filters.userId }),
          ...(filters.projectId && { projectId: filters.projectId }),
          ...(filters.kind && { kind: filters.kind }),
          ...(filters.templateSlug && { templateSlug: filters.templateSlug }),
          ...(filters.ai === "ai" && { aiEnabled: true }),
          ...(filters.ai === "template" && { aiEnabled: false }),
          ...(filters.from && { from: new Date(filters.from) }),
          ...(filters.to && { to: new Date(`${filters.to}T23:59:59.999Z`) }),
        },
      }),
    { initialData: initialData!, errorMessage: "Failed to load images." },
  );

  const deleteMutation = useApiMutation((id: string) => client.api.admin.images({ id }).delete(), {
    successMessage: "Image removed.",
    invalidateKeys: [queryKeys.admin.imagesAll()],
  });

  const bulkDeleteMutation = useApiMutation(
    (ids: string[]) => client.api.admin.images.delete({ ids }),
    {
      successMessage: (result) =>
        `Removed ${result.deleted} image${result.deleted === 1 ? "" : "s"}.`,
      invalidateKeys: [queryKeys.admin.imagesAll()],
      onSuccess: () => setSelected(new Set()),
    },
  );

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const pageIds = items.map((img) => img.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const somePageSelected = !allPageSelected && pageIds.some((id) => selected.has(id));

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const togglePage = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allPageSelected) pageIds.forEach((id) => next.delete(id));
      else pageIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleDelete = async (image: AdminImageItem) => {
    const ok = await confirm({
      title: "Delete image",
      description: `This permanently removes the generated image for ${image.sourceUrl ?? image.id}. This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(image.id);
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selected);
    const ok = await confirm({
      title: `Delete ${ids.length} image${ids.length === 1 ? "" : "s"}`,
      description:
        "This permanently removes the selected images across all projects. This action cannot be undone.",
      confirmLabel: "Delete selected",
      destructive: true,
    });
    if (ok) bulkDeleteMutation.mutate(ids);
  };

  const columns = buildAdminImageColumns({
    selected,
    allPageSelected,
    somePageSelected,
    onToggleRow: toggleRow,
    onTogglePage: togglePage,
    onDelete: handleDelete,
  });

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Image Moderation"
        description="Review and remove generated images across all projects."
      />

      <AdminImageFiltersBar
        filters={filters}
        setFilter={setFilterAndResetPage}
        templates={templatesData ?? []}
      />

      {selected.size > 0 && (
        <AdminImageBulkBar
          selectedCount={selected.size}
          onClear={() => setSelected(new Set())}
          onDelete={handleBulkDelete}
          disabled={bulkDeleteMutation.isPending}
        />
      )}

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        loading={isLoading}
        empty={{
          title: "No images",
          description: hasActiveFilters
            ? "No images match the current filters."
            : "No images have been generated yet.",
        }}
      />

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </Stack>
  );
}
