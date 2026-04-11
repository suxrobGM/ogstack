import { t, type Static } from "elysia";
import { NotificationType as PrismaNotificationType } from "@/generated/prisma";
import { PaginationQueryBaseSchema } from "@/types/pagination";
import { PaginatedResponseSchema } from "@/types/response";

export const NotificationTypeSchema = t.Enum(PrismaNotificationType);

export const NotificationSchema = t.Object({
  id: t.String(),
  type: NotificationTypeSchema,
  title: t.String(),
  message: t.String(),
  metadata: t.Optional(t.Unknown()),
  actionUrl: t.Optional(t.Nullable(t.String())),
  readAt: t.Optional(t.Nullable(t.Date())),
  createdAt: t.Date(),
});

export const NotificationListQuerySchema = t.Composite([
  PaginationQueryBaseSchema,
  t.Object({
    unreadOnly: t.Optional(t.Union([t.Literal("true"), t.Literal("false")])),
    type: t.Optional(NotificationTypeSchema),
  }),
]);

export const MarkReadBodySchema = t.Object({
  ids: t.Array(t.String(), { minItems: 1 }),
});

export const UnreadCountResponseSchema = t.Object({
  unreadCount: t.Integer(),
});

export const NotificationListResponseSchema = PaginatedResponseSchema(NotificationSchema);

export type Notification = Static<typeof NotificationSchema>;
export type NotificationType = Static<typeof NotificationTypeSchema>;
export type NotificationListQuery = Static<typeof NotificationListQuerySchema>;
export type MarkReadBody = Static<typeof MarkReadBodySchema>;
