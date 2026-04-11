"use client";

import { useApiMutation, useApiQuery } from "@/hooks";
import { client } from "@/lib/api/client";
import { queryKeys } from "@/lib/query-keys";

const POLL_INTERVAL = 30_000;

export function useNotifications() {
  const unreadCountQuery = useApiQuery(
    queryKeys.notifications.unreadCount(),
    () => client.api.notifications["unread-count"].get(),
    { refetchInterval: POLL_INTERVAL },
  );

  const listQuery = useApiQuery(
    queryKeys.notifications.recent(),
    () => client.api.notifications.get({ query: { page: 1, limit: 10 } }),
    { refetchInterval: POLL_INTERVAL },
  );

  const notificationInvalidation = [
    queryKeys.notifications.unreadCount(),
    queryKeys.notifications.recent(),
    queryKeys.notifications.all,
  ];

  const markAsRead = useApiMutation(
    (ids: string[]) => client.api.notifications.read.patch({ ids }),
    { invalidateKeys: notificationInvalidation },
  );

  const markAllAsRead = useApiMutation(() => client.api.notifications["read-all"].patch(), {
    invalidateKeys: notificationInvalidation,
  });

  const deleteNotification = useApiMutation(
    (id: string) => client.api.notifications({ id }).delete(),
    { invalidateKeys: notificationInvalidation },
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
