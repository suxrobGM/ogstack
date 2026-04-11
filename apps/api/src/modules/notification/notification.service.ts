import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors";
import {
  PrismaClient,
  type Prisma,
  type NotificationType as PrismaNotificationType,
} from "@/generated/prisma";
import type { PaginatedResponse } from "@/types/response";
import type { Notification, NotificationListQuery, NotificationType } from "./notification.schema";

interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: unknown;
  actionUrl?: string;
}

@singleton()
export class NotificationService {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateNotificationData): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type as PrismaNotificationType,
        title: data.title,
        message: data.message,
        metadata: data.metadata ?? undefined,
        actionUrl: data.actionUrl ?? null,
      },
    });

    return this.toResponse(notification);
  }

  async createForAllUsers(type: NotificationType, title: string, message: string): Promise<number> {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null, suspended: false },
      select: { id: true },
    });

    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        type: type as PrismaNotificationType,
        title,
        message,
      })),
    });

    return users.length;
  }

  async list(
    userId: string,
    query: NotificationListQuery,
  ): Promise<PaginatedResponse<Notification>> {
    const { page, limit, unreadOnly, type } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(unreadOnly === "true" && { readAt: null }),
      ...(type && { type: type as PrismaNotificationType }),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      items: items.map((n) => this.toResponse(n)),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: { userId, readAt: null },
    });
  }

  async markAsRead(userId: string, ids: string[]): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { id: { in: ids }, userId },
      data: { readAt: new Date() },
    });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }

  async delete(userId: string, notificationId: string): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundError("Notification not found");
    }

    await this.prisma.notification.delete({ where: { id: notificationId } });
  }

  private toResponse(notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    metadata: unknown;
    actionUrl: string | null;
    readAt: Date | null;
    createdAt: Date;
  }): Notification {
    return {
      id: notification.id,
      type: notification.type as NotificationType,
      title: notification.title,
      message: notification.message,
      metadata: notification.metadata ?? undefined,
      actionUrl: notification.actionUrl,
      readAt: notification.readAt,
      createdAt: notification.createdAt,
    };
  }
}
