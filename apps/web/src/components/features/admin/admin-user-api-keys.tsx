import type { ReactElement } from "react";
import {
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { MonoId } from "@/components/ui/display/mono-id";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import type { AdminUserDetail } from "@/types/api";

interface AdminUserApiKeysProps {
  apiKeys: AdminUserDetail["apiKeys"];
}

export function AdminUserApiKeys(props: AdminUserApiKeysProps): ReactElement {
  const { apiKeys } = props;

  return (
    <Stack spacing={2}>
      <SectionHeader title="API Keys" />
      <Surface padding={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ px: 3 }}>Name</TableCell>
              <TableCell sx={{ px: 3 }}>Prefix</TableCell>
              <TableCell sx={{ px: 3 }}>Last used</TableCell>
              <TableCell sx={{ px: 3 }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {apiKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ px: 3, py: 4, textAlign: "center" }}>
                  <Typography variant="body2Muted">No API keys.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              apiKeys.map((k) => (
                <TableRow key={k.id}>
                  <TableCell sx={{ px: 3 }}>{k.name}</TableCell>
                  <TableCell sx={{ px: 3 }}>
                    <MonoId id={k.prefix} />
                  </TableCell>
                  <TableCell sx={{ px: 3 }}>
                    {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell sx={{ px: 3 }}>
                    {k.revokedAt ? (
                      <Chip size="small" label="revoked" color="error" variant="outlined" />
                    ) : (
                      <Chip size="small" label="active" color="success" variant="outlined" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Surface>
    </Stack>
  );
}
