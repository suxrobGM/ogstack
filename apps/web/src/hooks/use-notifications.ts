"use client";

import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api";

const POLL_INTERVAL = 30_000;

export function useNotifications() {
  const unreadCountQuery = useApiQuery(
    ["notifications", "unread-count"],
    () => client.api.notifications["unread-count"].get(),
    { refetchInterval: POLL_INTERVAL },
  );

  const listQuery = useApiQuery(
    ["notifications", "recent"],
    () => client.api.notifications.get({ query: { page: 1, limit: 10 } }),
    { refetchInterval: POLL_INTERVAL },
  );

  const markAsRead = useApiMutation(
    (ids: string[]) => client.api.notifications.read.patch({ ids }),
    {
      invalidateKeys: [
        ["notifications", "unread-count"],
        ["notifications", "recent"],
        ["notifications", "list"],
      ],
    },
  );

  const markAllAsRead = useApiMutation(() => client.api.notifications["read-all"].patch(), {
    invalidateKeys: [
      ["notifications", "unread-count"],
      ["notifications", "recent"],
      ["notifications", "list"],
    ],
  });

  const deleteNotification = useApiMutation(
    (id: string) => client.api.notifications({ id }).delete(),
    {
      invalidateKeys: [
        ["notifications", "unread-count"],
        ["notifications", "recent"],
        ["notifications", "list"],
      ],
    },
  );

  return {
    notifications: listQuery.data?.items ?? [],
    unreadCount: unreadCountQuery.data?.unreadCount ?? 0,
    isLoading: listQuery.isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
}
