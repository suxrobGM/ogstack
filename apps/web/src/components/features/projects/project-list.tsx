"use client";

import { useState, type ReactElement } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import {
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { DataTable, type Column } from "@/components/ui/data/data-table";
import { Pagination } from "@/components/ui/data/pagination";
import { MonoId } from "@/components/ui/display/mono-id";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiMutation, useApiQuery, useConfirm, useDebouncedValue } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { iconSizes } from "@/theme";
import type { Project, ProjectListResponse } from "@/types/api";
import { ProjectDialog } from "./project-dialog";

interface ProjectListProps {
  initialData?: ProjectListResponse | null;
}

export function ProjectList(props: ProjectListProps): ReactElement {
  const { initialData } = props;
  const router = useRouter();
  const confirm = useConfirm();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);

  const { data, isLoading } = useApiQuery<ProjectListResponse>(
    queryKeys.projects.list({ page, search: debouncedSearch }),
    () => client.api.projects.get({ query: { page, limit: 10, search: debouncedSearch } }),
    { initialData: initialData!, errorMessage: "Failed to load projects." },
  );

  const deleteMutation = useApiMutation((id: string) => client.api.projects({ id }).delete(), {
    successMessage: "Project deleted.",
    invalidateKeys: [queryKeys.projects.all],
  });

  const items = data?.items ?? [];
  const pagination = data?.pagination;

  const handleDelete = async (project: Project) => {
    const confirmed = await confirm({
      title: "Delete Project",
      description: `This will permanently delete "${project.name}" and all its API keys and generated images. This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
      confirmationText: project.name,
      confirmationHint: (
        <Typography variant="body2Muted">
          Type <strong>{project.name}</strong> to confirm.
        </Typography>
      ),
    });

    if (confirmed) {
      deleteMutation.mutate(project.id);
    }
  };

  const columns: Column<Project>[] = [
    {
      key: "name",
      header: "Name",
      width: "30%",
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            cursor: "pointer",
            "&:hover": { textDecoration: "underline" },
          }}
          onClick={() => router.push(`/projects/${row.id}`)}
        >
          {row.name}
        </Typography>
      ),
    },
    {
      key: "publicId",
      header: "Public ID",
      render: (row) => <MonoId id={row.publicId} copyable />,
    },
    {
      key: "domains",
      header: "Domains",
      render: (row) =>
        row.domains.length > 0 ? (
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: "wrap", gap: 0.5 }}>
            {row.domains.map((domain) => (
              <Chip key={domain} label={domain} size="small" variant="outlined" />
            ))}
          </Stack>
        ) : (
          <Typography variant="body2Muted">All domains</Typography>
        ),
    },
    {
      key: "createdAt",
      header: "Created",
      width: 140,
      render: (row) => (
        <Typography variant="body2Muted">{new Date(row.createdAt).toLocaleDateString()}</Typography>
      ),
    },
    {
      key: "actions",
      header: "",
      width: 90,
      align: "right",
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setEditingProject(row);
              }}
            >
              <EditIcon sx={{ fontSize: iconSizes.sm }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row);
              }}
            >
              <DeleteIcon sx={{ fontSize: iconSizes.sm }} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Projects"
        description="Manage your OG image generation projects."
        actions={
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            New Project
          </Button>
        }
      />

      <TextField
        placeholder="Search projects..."
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
        sx={{ maxWidth: 360 }}
      />

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        loading={isLoading}
        onRowClick={(row) => router.push(`/projects/${row.id}`)}
        empty={{
          title: "No projects yet",
          description: debouncedSearch
            ? "No projects match your search. Try a different query."
            : "Create your first project to start generating OG images.",
          action: !debouncedSearch ? (
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              New Project
            </Button>
          ) : undefined,
        }}
      />

      {pagination && (
        <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      <ProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <ProjectDialog
        project={editingProject}
        open={editingProject !== null}
        onClose={() => setEditingProject(null)}
      />
    </Stack>
  );
}
