"use client";

import type { ReactElement } from "react";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button, Checkbox, Stack, Typography } from "@mui/material";

interface ImagesBulkActionsProps {
  allSelected: boolean;
  someSelected: boolean;
  selectedCount: number;
  onToggleAll: () => void;
  onDelete: () => void;
  deleting: boolean;
}

export function ImagesBulkActions(props: ImagesBulkActionsProps): ReactElement {
  const { allSelected, someSelected, selectedCount, onToggleAll, onDelete, deleting } = props;

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ alignItems: "center", justifyContent: "space-between" }}
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        <Checkbox
          size="small"
          checked={allSelected}
          indeterminate={!allSelected && someSelected}
          onChange={onToggleAll}
        />
        <Typography variant="body2Muted">
          {selectedCount > 0 ? `${selectedCount} selected` : "Select all on this page"}
        </Typography>
      </Stack>
      {selectedCount > 0 && (
        <Button
          color="error"
          size="small"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
          loading={deleting}
        >
          Delete selected
        </Button>
      )}
    </Stack>
  );
}
