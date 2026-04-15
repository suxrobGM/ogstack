"use client";

import type { ReactElement } from "react";
import { FormLabel, MenuItem, Select, Stack, Typography } from "@mui/material";
import type { Project } from "@/types/api";

interface ProjectSelectProps {
  projects: Pick<Project, "id" | "name">[];
  selectedProjectId: string;
  onChange: (id: string) => void;
  required?: boolean;
}

export function ProjectSelect(props: ProjectSelectProps): ReactElement {
  const { projects, selectedProjectId, onChange, required } = props;

  return (
    <Stack spacing={0.5}>
      <FormLabel required={required}>Select Project</FormLabel>
      <Select
        value={selectedProjectId}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        {projects.map((p) => (
          <MenuItem key={p.id} value={p.id}>
            {p.name}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
