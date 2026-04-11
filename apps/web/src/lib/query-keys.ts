export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (params: { page: number; search: string }) =>
      [...queryKeys.projects.all, params] as const,
    detail: (id: string) => [...queryKeys.projects.all, id] as const,
  },

  apiKeys: {
    all: ["api-keys"] as const,
    byProject: (projectId: string) => [...queryKeys.apiKeys.all, projectId] as const,
  },

  notifications: {
    all: ["notifications"] as const,
    list: (filter: string, page: number) =>
      [...queryKeys.notifications.all, "list", filter, page] as const,
    unreadCount: () => [...queryKeys.notifications.all, "unread-count"] as const,
    recent: () => [...queryKeys.notifications.all, "recent"] as const,
  },

  billing: {
    all: ["billing"] as const,
    plans: () => [...queryKeys.billing.all, "plans"] as const,
    subscription: () => [...queryKeys.billing.all, "subscription"] as const,
  },

  usage: {
    all: ["usage"] as const,
  },

  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
  },
} as const;
