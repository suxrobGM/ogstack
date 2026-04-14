"use client";

import type { ReactElement } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
import { ROUTES } from "@/lib/constants";

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  message: string;
}

export function UpgradePrompt(props: UpgradePromptProps): ReactElement {
  const { open, onClose, message } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Plan limit reached</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {message}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Upgrade your plan to unlock more images and features.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Dismiss</Button>
        <Button href={ROUTES.billing} variant="contained" onClick={onClose}>
          View plans
        </Button>
      </DialogActions>
    </Dialog>
  );
}
