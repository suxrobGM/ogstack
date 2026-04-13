"use client";

import type { ReactElement } from "react";
import {
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { MonoId } from "@/components/ui/display/mono-id";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { Surface } from "@/components/ui/layout/surface";
import { ROUTES } from "@/lib/constants";
import type { AdminUserDetail } from "@/types/api";

interface AdminUserProjectsProps {
  userId: string;
  projects: AdminUserDetail["projects"];
}

export function AdminUserProjects(props: AdminUserProjectsProps): ReactElement {
  const { userId, projects } = props;
  const router = useRouter();

  return (
    <Stack spacing={2}>
      <SectionHeader
        title="Projects"
        actions={
          <Button
            size="small"
            variant="outlined"
            onClick={() => router.push(`${ROUTES.adminImages}?userId=${userId}`)}
          >
            View images
          </Button>
        }
      />
      <Surface padding={0}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ px: 3 }}>Name</TableCell>
              <TableCell sx={{ px: 3 }}>Public ID</TableCell>
              <TableCell sx={{ px: 3 }}>Status</TableCell>
              <TableCell sx={{ px: 3 }}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} sx={{ px: 3, py: 4, textAlign: "center" }}>
                  <Typography variant="body2Muted">No projects.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              projects.map((p) => (
                <TableRow key={p.id}>
                  <TableCell sx={{ px: 3 }}>{p.name}</TableCell>
                  <TableCell sx={{ px: 3 }}>
                    <MonoId id={p.publicId} copyable />
                  </TableCell>
                  <TableCell sx={{ px: 3 }}>
                    {p.isActive ? (
                      <Chip size="small" label="active" color="success" variant="outlined" />
                    ) : (
                      <Chip size="small" label="inactive" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell sx={{ px: 3 }}>{new Date(p.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Surface>
    </Stack>
  );
}
