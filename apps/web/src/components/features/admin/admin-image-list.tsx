"use client";

import { useState, type ReactElement } from "react";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataTable, type Column } from "@/components/ui/data/data-table";
import { Pagination } from "@/components/ui/data/pagination";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiMutation, useApiQuery, useDebouncedValue } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers/confirm-provider";
import { iconSizes } from "@/theme";
import type { AdminImageItem, AdminImageListResponse } from "@/types/api";

interface AdminImageListProps {
  initialData?: AdminImageListResponse | null;
  initialUserId?: string;
  initialProjectId?: string;
}

export function AdminImageList(props: AdminImageListProps): ReactElement {
  const { initialData, initialUserId = "", initialProjectId = "" } = props;
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [userId, setUserId] = useState(initialUserId);
  const [projectId, setProjectId] = useState(initialProjectId);

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useApiQuery<AdminImageListResponse>(
    queryKeys.admin.imagesList({ page, search: debouncedSearch, userId, projectId }),
    () =>
      client.api.admin.images.get({
        query: {
          page,
          limit: 20,
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(userId && { userId }),
          ...(projectId && { projectId }),
        },
      }),
    { initialData: initialData!, errorMessage: "Failed to load images." },
  );

  const deleteMutation = useApiMutation((id: string) => client.api.admin.images({ id }).delete(), {
    successMessage: "Image removed.",
    invalidateKeys: [queryKeys.admin.imagesAll()],
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleDelete = async (image: AdminImageItem) => {
    const ok = await confirm({
      title: "Delete image",
      description: `This permanently removes the generated image for ${image.sourceUrl ?? image.id}. This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (ok) deleteMutation.mutate(image.id);
  };

  const columns: Column<AdminImageItem>[] = [
    {
      key: "preview",
      header: "",
      width: 96,
      render: (row) =>
        row.cdnUrl ? (
          <Box
            component="img"
            src={row.cdnUrl}
            alt=""
            sx={{
              width: 80,
              height: 42,
              objectFit: "cover",
              borderRadius: 1,
              display: "block",
            }}
          />
        ) : (
          <Box sx={{ width: 80, height: 42, bgcolor: "surfaces.elevated", borderRadius: 1 }} />
        ),
    },
    {
      key: "sourceUrl",
      header: "Source URL",
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            maxWidth: 320,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {row.sourceUrl ?? "—"}
        </Typography>
      ),
    },
    {
      key: "userEmail",
      header: "User",
      render: (row) => <Typography variant="body2Muted">{row.userEmail}</Typography>,
    },
    {
      key: "projectName",
      header: "Project",
      render: (row) => <Typography variant="body2Muted">{row.projectName || "—"}</Typography>,
    },
    {
      key: "template",
      header: "Template",
      width: 140,
      render: (row) =>
        row.template ? <Chip size="small" label={row.template} variant="outlined" /> : "—",
    },
    {
      key: "serveCount",
      header: "Served",
      width: 90,
      align: "right",
      render: (row) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: "tabular-nums" }}>
          {row.serveCount}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      width: 120,
      render: (row) => (
        <Typography variant="body2Muted">{new Date(row.createdAt).toLocaleDateString()}</Typography>
      ),
    },
    {
      key: "actions",
      header: "",
      width: 60,
      align: "right",
      render: (row) => (
        <Tooltip title="Delete">
          <IconButton size="small" onClick={() => handleDelete(row)}>
            <DeleteIcon sx={{ fontSize: iconSizes.sm }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Image Moderation"
        description="Review and remove generated images across all projects."
      />

      <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <TextField
          placeholder="Search by source URL or title..."
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
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
          sx={{ maxWidth: 360, flex: 1 }}
        />
        {userId && (
          <Chip
            label={`User: ${userId.slice(0, 8)}`}
            onDelete={() => {
              setUserId("");
              setPage(1);
            }}
            deleteIcon={<CloseIcon />}
            size="small"
          />
        )}
        {projectId && (
          <Chip
            label={`Project: ${projectId.slice(0, 8)}`}
            onDelete={() => {
              setProjectId("");
              setPage(1);
            }}
            deleteIcon={<CloseIcon />}
            size="small"
          />
        )}
      </Stack>

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        loading={isLoading}
        empty={{
          title: "No images",
          description:
            debouncedSearch || userId || projectId
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
