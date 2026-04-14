"use client";

import { useState, type ReactElement } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Chip, IconButton, Tooltip, Typography } from "@mui/material";
import { CreateApiKeyDialog } from "@/components/features/api-keys/create-api-key-dialog";
import { DataTable, type Column } from "@/components/ui/data/data-table";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";
import { useConfirm } from "@/providers/confirm-provider";
import { iconSizes } from "@/theme";
import type { ApiKey, ApiKeyListResponse } from "@/types/api";

interface ProjectApiKeysProps {
  projectId: string;
  initialApiKeys: ApiKeyListResponse;
}

export function ProjectApiKeys(props: ProjectApiKeysProps): ReactElement {
  const { projectId, initialApiKeys } = props;
  const confirm = useConfirm();
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useApiQuery<ApiKeyListResponse>(
    queryKeys.apiKeys.byProject(projectId),
    () => client.api.projects({ id: projectId })["api-keys"].get(),
    { initialData: initialApiKeys, errorMessage: "Failed to load API keys." },
  );

  const revokeMutation = useApiMutation((id: string) => client.api["api-keys"]({ id }).delete(), {
    successMessage: "API key revoked.",
    invalidateKeys: [queryKeys.apiKeys.byProject(projectId)],
  });

  const apiKeys = Array.isArray(data) ? data : [];

  const handleRevoke = async (key: ApiKey) => {
    const confirmed = await confirm({
      title: "Revoke API Key",
      description: `This will permanently revoke "${key.name}" (${key.prefix}...). Any applications using this key will stop working immediately.`,
      confirmLabel: "Revoke",
      destructive: true,
    });

    if (confirmed) {
      revokeMutation.mutate(key.id);
    }
  };

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

  return (
    <Box>
      <SectionHeader
        title="API Keys"
        description="Manage API keys for programmatic access to this project."
        actions={
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            New API Key
          </Button>
        }
      />
      <Box sx={{ mt: 2 }}>
        <DataTable
          columns={columns}
          rows={apiKeys}
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
      </Box>
      <CreateApiKeyDialog
        projectId={projectId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
