"use client";

import { useState, type ReactElement } from "react";
import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useApiQuery } from "@/hooks";
import { client } from "@/lib/api";
import type { ProjectListResponse } from "@/types/api";

interface ProjectListProps {
  initialData?: ProjectListResponse | null;
}

export function ProjectList(props: ProjectListProps): ReactElement {
  const { initialData } = props;
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useApiQuery<ProjectListResponse>(
    ["projects", { page, search }],
    () => client.api.projects.get({ query: { page, limit: 10, search } }),
    { initialData: initialData!, errorMessage: "Failed to load projects." },
  );

  const items = data?.items ?? [];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Projects</Typography>
        <Button variant="contained">New Project</Button>
      </Stack>

      <TextField
        placeholder="Search projects..."
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 2 }}
      />

      {isLoading ? (
        <CircularProgress />
      ) : items.length === 0 ? (
        <Typography color="text.secondary">No projects found.</Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Public ID</TableCell>
              <TableCell>Domains</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {item.publicId}
                  </Typography>
                </TableCell>
                <TableCell>{item.domains.join(", ") || "—"}</TableCell>
                <TableCell>{new Date(item.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="right">{/* TODO: Add edit and delete actions */}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
