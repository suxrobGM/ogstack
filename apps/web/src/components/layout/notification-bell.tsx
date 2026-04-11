"use client";

import type { ReactElement } from "react";
import { NotificationPopover } from "@/components/features/notifications/notification-popover";

interface NotificationBellProps {
  collapsed?: boolean;
}

export function NotificationBell(props: NotificationBellProps): ReactElement {
  const { collapsed = false } = props;
  return <NotificationPopover collapsed={collapsed} />;
}
