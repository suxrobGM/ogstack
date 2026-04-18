export const queryKeys = {
  projects: {
    all: ["projects"] as const,
    list: (params: { page: number; search: string }) =>
      [...queryKeys.projects.all, params] as const,
    detail: (id: string) => [...queryKeys.projects.all, id] as const,
  },

  apiKeys: {
    all: ["keys"] as const,
    list: (projectId: string) => [...queryKeys.apiKeys.all, "list", projectId] as const,
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
    stats: (period?: string) => [...queryKeys.usage.all, "stats", period ?? "current"] as const,
  },

  templates: {
    all: ["templates"] as const,
    list: () => [...queryKeys.templates.all, "list"] as const,
  },

  images: {
    all: ["images"] as const,
    list: (params: {
      page: number;
      search: string;
      projectId: string;
      category: string;
      kind: string;
      from: string;
      to: string;
    }) => [...queryKeys.images.all, "list", params] as const,
    detail: (id: string) => [...queryKeys.images.all, id] as const,
  },

  users: {
    all: ["users"] as const,
    me: () => [...queryKeys.users.all, "me"] as const,
  },

  admin: {
    all: ["admin"] as const,
    stats: () => [...queryKeys.admin.all, "stats"] as const,
    usersAll: () => [...queryKeys.admin.all, "users"] as const,
    usersList: (params: { page: number; search: string; plan: string; status: string }) =>
      [...queryKeys.admin.all, "users", "list", params] as const,
    userDetail: (id: string) => [...queryKeys.admin.all, "users", id] as const,
    imagesAll: () => [...queryKeys.admin.all, "images"] as const,
    imagesList: (params: { page: number; search: string; userId: string; projectId: string }) =>
      [...queryKeys.admin.all, "images", "list", params] as const,
  },
} as const;
