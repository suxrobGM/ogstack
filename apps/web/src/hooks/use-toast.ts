"use client";

import { use } from "react";
import { NotificationContext, type ToastApi } from "@/providers/notification-provider";

export function useToast(): ToastApi {
  const api = use(NotificationContext);

  if (!api) {
    throw new Error("useToast must be used within a NotificationProvider");
  }

  return api;
}
