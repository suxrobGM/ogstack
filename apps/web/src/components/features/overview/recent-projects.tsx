"use client";

import type { ReactElement } from "react";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import { Button, Chip, Link, Stack, Typography } from "@mui/material";
import { DataTable } from "@/components/ui/data/data-table";
import { EmptyState } from "@/components/ui/data/empty-state";
import { MonoId } from "@/components/ui/display/mono-id";
import { SectionHeader } from "@/components/ui/layout/section-header";
import { ROUTES } from "@/lib/constants";
import type { Project } from "@/types/api";

interface RecentProjectsProps {
  projects: Project[];
}

export function RecentProjects(props: RecentProjectsProps): ReactElement {
  const { projects } = props;

  return (
    <Stack spacing={2.5}>
      <SectionHeader
        title="Recent projects"
        actions={
          projects.length > 0 ? (
            <Link href={ROUTES.projects} variant="body2" underline="hover">
              View all
            </Link>
          ) : undefined
        }
      />
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderOpenIcon />}
          title="No projects yet"
          description="Create your first project to start generating OG images."
          action={
            <Button href={ROUTES.projects} variant="contained">
              Go to projects
            </Button>
          }
        />
      ) : (
        <DataTable
          columns={[
            {
              key: "name",
              header: "Name",
              render: (row) => (
                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                  <Typography variant="body2">{row.name}</Typography>
                  {!row.isActive && <Chip label="inactive" size="small" />}
                </Stack>
              ),
            },
            {
              key: "publicId",
              header: "Public ID",
              render: (row) => <MonoId id={row.publicId} />,
            },
            {
              key: "createdAt",
              header: "Created",
              render: (row) => (
                <Typography variant="body2Muted">
                  {new Date(row.createdAt).toLocaleDateString()}
                </Typography>
              ),
            },
          ]}
          rows={projects.slice(0, 3)}
          rowKey={(row) => row.id}
        />
      )}
    </Stack>
  );
}
