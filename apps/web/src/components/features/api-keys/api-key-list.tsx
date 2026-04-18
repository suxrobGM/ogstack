"use client";

import { useState, type ReactElement } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { Button, Chip, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { DataTable, type Column } from "@/components/ui/data/data-table";
import { EmptyState } from "@/components/ui/data/empty-state";
import { SelectInput } from "@/components/ui/form/select-input";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers";
import { iconSizes } from "@/theme";
import type { ApiKey, ApiKeyListResponse, Project } from "@/types/api";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

const ALL_PROJECTS = "__all__";

interface ApiKeyListProps {
  projects: Project[];
  initialData?: ApiKeyListResponse | null;
}

export function ApiKeyList(props: ApiKeyListProps): ReactElement {
  const { projects, initialData } = props;
  const confirm = useConfirm();

  const [filter, setFilter] = useState<string>(ALL_PROJECTS);
  const [createOpen, setCreateOpen] = useState(false);

  const projectIdQuery = filter === ALL_PROJECTS ? undefined : filter;

  const filterItems = [
    { value: ALL_PROJECTS, label: "All projects" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];

  const { data, isLoading } = useApiQuery<ApiKeyListResponse>(
    queryKeys.apiKeys.list(filter),
    () =>
      client.api.keys.get({
        query: projectIdQuery ? { projectId: projectIdQuery } : {},
      }),
    {
      initialData: filter === ALL_PROJECTS ? (initialData ?? undefined) : undefined,
      errorMessage: "Failed to load API keys.",
    },
  );

  const deleteMutation = useApiMutation((id: string) => client.api.keys({ id }).delete(), {
    successMessage: "API key revoked.",
    invalidateKeys: [queryKeys.apiKeys.all],
  });

  const items = Array.isArray(data) ? data : [];

  const handleRevoke = async (key: ApiKey) => {
    const confirmed = await confirm({
      title: "Revoke API Key",
      description: `This will permanently revoke "${key.name}" (${key.prefix}...). Any applications using this key will stop working immediately.`,
      confirmLabel: "Revoke",
      destructive: true,
    });

    if (confirmed) {
      deleteMutation.mutate(key.id);
    }
  };

  if (projects.length === 0) {
    return (
      <Stack spacing={3}>
        <PageHeader
          title="API Keys"
          description="Manage API keys for programmatic access to your projects."
        />
        <EmptyState
          icon={<VpnKeyIcon sx={{ fontSize: 48 }} />}
          title="No projects yet"
          description="Create a project first to start managing API keys."
          action={
            <Button variant="contained" href="/projects">
              Go to Projects
            </Button>
          }
        />
      </Stack>
    );
  }

  const columns: Column<ApiKey>[] = [
    {
      key: "name",
      header: "Name",
      width: "25%",
    },
    {
      key: "prefix",
      header: "Key Prefix",
      render: (row) => <Chip label={`${row.prefix}...`} size="small" variant="outlined" />,
    },
    {
      key: "scope",
      header: "Scope",
      render: (row) =>
        row.project ? (
          <Chip label={row.project.name} size="small" variant="outlined" />
        ) : (
          <Chip label="All projects" size="small" color="success" variant="outlined" />
        ),
    },
    {
      key: "lastUsedAt",
      header: "Last Used",
      render: (row) =>
        row.lastUsedAt ? (
          <Typography variant="body2Muted">
            {new Date(row.lastUsedAt).toLocaleDateString()}
          </Typography>
        ) : (
          <Typography variant="body2Muted">Never</Typography>
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
      width: 60,
      align: "right",
      render: (row) => (
        <Tooltip title="Revoke">
          <IconButton size="small" onClick={() => handleRevoke(row)}>
            <DeleteIcon sx={{ fontSize: iconSizes.sm }} />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <Stack spacing={3}>
      <PageHeader
        title="API Keys"
        description="Manage API keys for programmatic access. Keys can be scoped to a single project or apply to all of your projects."
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <SelectInput
              label="Scope"
              value={filter}
              onChange={setFilter}
              items={filterItems}
              minWidth={200}
            />
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              New API Key
            </Button>
          </Stack>
        }
      />

      <DataTable
        columns={columns}
        rows={items}
        rowKey={(row) => row.id}
        loading={isLoading}
        empty={{
          title: "No API keys",
          description: "Create an API key to access your projects programmatically.",
          action: (
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              New API Key
            </Button>
          ),
        }}
      />

      <CreateApiKeyDialog
        projects={projects}
        defaultProjectId={projectIdQuery}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Stack>
  );
}
