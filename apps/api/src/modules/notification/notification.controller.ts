import { Elysia } from "elysia";
import { container } from "@/common/di";
import { authGuard } from "@/common/middleware";
import { StringIdParamSchema } from "@/types/request";
import { MessageResponseSchema } from "@/types/response";
import {
  MarkReadBodySchema,
  NotificationListQuerySchema,
  NotificationListResponseSchema,
  UnreadCountResponseSchema,
} from "./notification.schema";
import { NotificationService } from "./notification.service";

const notificationService = container.resolve(NotificationService);

export const notificationController = new Elysia({
  prefix: "/notifications",
  tags: ["Notifications"],
})
  .use(authGuard)
  .get("/", ({ user, query }) => notificationService.list(user.id, query), {
    query: NotificationListQuerySchema,
    response: NotificationListResponseSchema,
    detail: {
      summary: "List notifications",
      description: "Get user's notifications with optional unread/type filters and pagination.",
    },
  })
  .get(
    "/unread-count",
    async ({ user }) => {
      const unreadCount = await notificationService.getUnreadCount(user.id);
      return { unreadCount };
    },
    {
      response: UnreadCountResponseSchema,
      detail: {
        summary: "Get unread count",
        description: "Get the number of unread notifications for the badge.",
      },
    },
  )
  .patch(
    "/read",
    async ({ user, body }) => {
      await notificationService.markAsRead(user.id, body.ids);
      return { message: "Notifications marked as read" };
    },
    {
      body: MarkReadBodySchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Mark as read",
        description: "Mark specific notifications as read by IDs.",
      },
    },
  )
  .patch(
    "/read-all",
    async ({ user }) => {
      await notificationService.markAllAsRead(user.id);
      return { message: "All notifications marked as read" };
    },
    {
      response: MessageResponseSchema,
      detail: {
        summary: "Mark all as read",
        description: "Mark all unread notifications as read.",
      },
    },
  )
  .delete(
    "/:id",
    async ({ user, params }) => {
      await notificationService.delete(user.id, params.id);
      return { message: "Notification deleted" };
    },
    {
      params: StringIdParamSchema,
      response: MessageResponseSchema,
      detail: {
        summary: "Delete notification",
        description: "Delete a specific notification.",
      },
    },
  );
