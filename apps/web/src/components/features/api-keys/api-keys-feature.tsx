"use client";

import type { ReactElement } from "react";
import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Pagination,
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
import { PAGINATION_DEFAULTS } from "@/lib/constants";
import { CreateApiKeyDialog } from "./create-api-key-dialog";

export function ApiKeysFeature(): ReactElement {
  const [page, setPage] = useState(PAGINATION_DEFAULTS.page);
  const [createOpen, setCreateOpen] = useState(false);

  // API keys are scoped to a project — projectId would come from route params in a real implementation.
  // TODO: Wire to selected project once projects page and routing are in place.
  const { data, isLoading } = useApiQuery(
    ["api-keys", { page }],
    () => client.api.projects[":projectId"]["api-keys"].get({ params: { projectId: "" } }),
    { errorMessage: "Failed to load API keys." },
  );

  const items = Array.isArray(data) ? data : [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">API Keys</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          New API Key
        </Button>
      </Stack>

      {isLoading ? (
        <CircularProgress />
      ) : items.length === 0 ? (
        <Typography color="text.secondary">No API keys found.</Typography>
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
                  {item.lastUsedAt
                    ? new Date(item.lastUsedAt).toLocaleDateString()
                    : <Typography variant="body2" color="text.secondary">Never</Typography>
                  }
                </TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">
                  {/* TODO: Add revoke action */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateApiKeyDialog open={createOpen} onClose={() => setCreateOpen(false)} />
    </Box>
  );
}
