"use client";

import type { ReactElement } from "react";
import { useState } from "react";
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
import SearchIcon from "@mui/icons-material/Search";
import { useApiQuery } from "@/hooks";
import { client } from "@/lib/api";

export function ProjectsFeature(): ReactElement {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useApiQuery(
    ["projects", { page, search }],
    () => client.api.projects.get({ query: { page, limit: 10, search } }),
    { errorMessage: "Failed to load projects." },
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
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
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
                <TableCell align="right">
                  {/* TODO: Add edit and delete actions */}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
}
