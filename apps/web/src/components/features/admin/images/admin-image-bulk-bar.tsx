"use client";

import type { ReactElement } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Box, Button, Stack, Typography } from "@mui/material";

interface AdminImageBulkBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

export function AdminImageBulkBar(props: AdminImageBulkBarProps): ReactElement {
  const { selectedCount, onClear, onDelete, disabled } = props;

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        px: 2,
        py: 1.25,
        borderRadius: 1,
        bgcolor: "action.selected",
      }}
    >
      <Typography variant="body2">{selectedCount} selected</Typography>
      <Box sx={{ flex: 1 }} />
      <Button size="small" variant="text" onClick={onClear} disabled={disabled}>
        Clear
      </Button>
      <Button
        size="small"
        variant="contained"
        color="error"
        startIcon={<DeleteIcon />}
        onClick={onDelete}
        disabled={disabled}
      >
        Delete selected
      </Button>
    </Stack>
  );
}
