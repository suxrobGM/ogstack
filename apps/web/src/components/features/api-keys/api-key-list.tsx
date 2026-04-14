"use client";

import { useState, type ReactElement } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import {
  Button,
  Chip,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { DataTable, type Column } from "@/components/ui/data/data-table";
import { EmptyState } from "@/components/ui/data/empty-state";
import { PageHeader } from "@/components/ui/layout/page-header";
import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers";
import { iconSizes } from "@/theme";
import type { ApiKey, ApiKeyListResponse, Project } from "@/types/api";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

interface ApiKeyListProps {
  projects: Project[];
  initialProjectId?: string;
  initialData?: ApiKeyListResponse | null;
}

export function ApiKeyList(props: ApiKeyListProps): ReactElement {
  const { projects, initialProjectId, initialData } = props;
  const confirm = useConfirm();

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId ?? "");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useApiQuery<ApiKeyListResponse>(
    queryKeys.apiKeys.byProject(selectedProjectId),
    () => client.api.projects({ id: selectedProjectId })["api-keys"].get(),
    {
      initialData: selectedProjectId === initialProjectId ? initialData! : undefined,
      errorMessage: "Failed to load API keys.",
      enabled: !!selectedProjectId,
    },
  );

  const deleteMutation = useApiMutation((id: string) => client.api["api-keys"]({ id }).delete(), {
    successMessage: "API key revoked.",
    invalidateKeys: [queryKeys.apiKeys.byProject(selectedProjectId)],
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
      width: "30%",
    },
    {
      key: "prefix",
      header: "Key Prefix",
      render: (row) => <Chip label={`${row.prefix}...`} size="small" variant="outlined" />,
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

  const projectSelector =
    projects.length > 1 ? (
      <Select
        size="small"
        value={selectedProjectId}
        onChange={(e) => setSelectedProjectId(e.target.value)}
        sx={{ minWidth: 200 }}
      >
        {projects.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name}
          </MenuItem>
        ))}
      </Select>
    ) : null;

  return (
    <Stack spacing={3}>
      <PageHeader
        title="API Keys"
        description="Manage API keys for programmatic access to your projects."
        actions={
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            {projectSelector}
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
          description: "Create an API key to access this project programmatically.",
          action: (
            <Button variant="contained" onClick={() => setCreateOpen(true)}>
              New API Key
            </Button>
          ),
        }}
      />

      <CreateApiKeyDialog
        projectId={selectedProjectId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Stack>
  );
}
