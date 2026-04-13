"use client";

import type { ReactElement } from "react";
import { MenuItem, Select, Stack, Typography } from "@mui/material";
import type { Project } from "@/types/api";

interface ProjectSelectProps {
  projects: Pick<Project, "id" | "name">[];
  selectedProjectId: string;
  onChange: (id: string) => void;
}

export function ProjectSelect(props: ProjectSelectProps): ReactElement {
  const { projects, selectedProjectId, onChange } = props;

  return (
    <Stack spacing={0.5}>
      <Typography variant="body2Muted">Project</Typography>
      <Select size="small" value={selectedProjectId} onChange={(e) => onChange(e.target.value)}>
        {projects.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
