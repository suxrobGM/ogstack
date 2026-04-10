"use client";

import { useState, type ReactElement } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useApiQuery } from "@/hooks";
import { client } from "@/lib/api";
import type { ApiKeyListResponse } from "@/types/api";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

interface ApiKeyListProps {
  projectId: string;
  initialData?: ApiKeyListResponse | null;
}

export function ApiKeyList(props: ApiKeyListProps): ReactElement {
  const { projectId, initialData } = props;
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useApiQuery<ApiKeyListResponse>(
    ["api-keys", projectId],
    () => client.api.projects({ id: projectId })["api-keys"].get(),
    { initialData: initialData!, errorMessage: "Failed to load API keys." },
  );

  const items = Array.isArray(data) ? data : [];

  return (
    <Box>
      <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4">API Keys</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          New API Key
        </Button>
      </Stack>

      {isLoading ? (
        <CircularProgress />
      ) : items.length === 0 ? (
        <Typography variant="body1Muted">No API keys found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Key Prefix</TableCell>
              <TableCell>Last Used</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Chip label={`${item.prefix}...`} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  {item.lastUsedAt ? (
                    new Date(item.lastUsedAt).toLocaleDateString()
                  ) : (
                    <Typography variant="body2Muted">Never</Typography>
                  )}
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">{/* TODO: Add revoke action */}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateApiKeyDialog
        projectId={projectId}
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
