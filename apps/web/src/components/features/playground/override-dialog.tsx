"use client";

import type { ReactElement } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";

interface OverrideDialogProps {
  open: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function OverrideDialog(props: OverrideDialogProps): ReactElement {
  const { open, isLoading, onConfirm, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <WarningAmberIcon color="warning" />
          <span>Replace existing image?</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          An image already exists for this URL in this project with different settings. Replacing it
          will <strong>permanently delete</strong> the current version from storage. Continue?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="warning" variant="contained" disabled={isLoading}>
          {isLoading ? "Replacing…" : "Replace"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
