"use client";

import type { ReactElement } from "react";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";

interface DowngradeDialogProps {
  open: boolean;
  targetPlanName: string;
  currentPlanName: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function DowngradeDialog(props: DowngradeDialogProps): ReactElement {
  const { open, targetPlanName, currentPlanName, isLoading, onConfirm, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <WarningAmberIcon color="warning" />
          <span>Downgrade to {targetPlanName}?</span>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Your plan will stay on <strong>{currentPlanName}</strong> until the end of the current
          billing period. After that, you&apos;ll be on <strong>{targetPlanName}</strong> and your
          quotas will match that tier.
        </DialogContentText>
        <Alert severity="warning" variant="outlined">
          Images generated on a higher tier (including ones without watermarks or using the Pro AI
          model) will stop serving through your public <code>og:image</code> meta tags once the
          downgrade takes effect. They&apos;ll unlock again if you re-subscribe at that tier.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} color="warning" variant="contained" disabled={isLoading}>
          {isLoading ? "Scheduling…" : "Confirm downgrade"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
