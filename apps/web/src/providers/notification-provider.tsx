"use client";

import { createContext, use, useState, type PropsWithChildren, type ReactElement } from "react";
import { Alert, Snackbar } from "@mui/material";

type Severity = "success" | "error" | "warning" | "info";

interface Toast {
  message: string;
  severity: Severity;
}

export interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

export const NotificationContext = createContext<ToastApi | null>(null);

export function NotificationProvider(props: PropsWithChildren): ReactElement {
  const { children } = props;
  const [toast, setToast] = useState<Toast | null>(null);

  const show = (message: string, severity: Severity) => {
    setToast({ message, severity });
  };

  const api: ToastApi = {
    success: (message) => show(message, "success"),
    error: (message) => show(message, "error"),
    warning: (message) => show(message, "warning"),
    info: (message) => show(message, "info"),
  };

  const handleClose = () => {
    setToast(null);
  };

  return (
    <NotificationContext value={api}>
      {children}
      <Snackbar
        open={toast !== null}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert
            onClose={handleClose}
            severity={toast.severity}
            variant="filled"
            sx={{ width: "100%" }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </NotificationContext>
  );
}

export function useToast(): ToastApi {
  const api = use(NotificationContext);

  if (!api) {
    throw new Error("useToast must be used within a NotificationProvider");
  }

  return api;
}
