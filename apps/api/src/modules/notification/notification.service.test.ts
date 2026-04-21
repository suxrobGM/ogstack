import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { NotificationService } from "./notification.service";

function createNotificationRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "notif-1",
    userId: "user-1",
    type: "SYSTEM_ANNOUNCEMENT",
    title: "Hello",
    message: "World",
    metadata: null,
    actionUrl: null,
    readAt: null,
    createdAt: new Date("2026-04-01"),
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    notification: {
      create: mock(() => Promise.resolve(createNotificationRow())),
      createMany: mock(() => Promise.resolve({ count: 3 })),
      findMany: mock(() => Promise.resolve([createNotificationRow()])),
      count: mock(() => Promise.resolve(1)),
      findUnique: mock(() => Promise.resolve(createNotificationRow())),
      updateMany: mock(() => Promise.resolve({ count: 1 })),
      delete: mock(() => Promise.resolve(createNotificationRow())),
    },
    user: {
      findMany: mock(() => Promise.resolve([{ id: "u1" }, { id: "u2" }, { id: "u3" }])),
    },
  } as unknown as PrismaClient;
}

describe("NotificationService", () => {
  let service: NotificationService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    service = container.resolve(NotificationService);
  });

  describe("create", () => {
    it("creates a notification and maps it to response shape", async () => {
      const result = await service.create({
        userId: "user-1",
        type: "SYSTEM_ANNOUNCEMENT",
        title: "Hi",
        message: "hello",
      });

      expect(result.id).toBe("notif-1");
      expect(result.type).toBe("SYSTEM_ANNOUNCEMENT");
      expect(mockPrisma.notification.create).toHaveBeenCalled();
    });

    it("passes metadata and actionUrl through", async () => {
      await service.create({
        userId: "user-1",
        type: "SYSTEM_ANNOUNCEMENT",
        title: "t",
        message: "m",
        metadata: { foo: 1 },
        actionUrl: "/x",
      });

      const call = (mockPrisma.notification.create as ReturnType<typeof mock>).mock
        .calls[0] as unknown[];
      const args = call[0] as { data: { metadata: unknown; actionUrl: string | null } };
      expect(args.data.metadata).toEqual({ foo: 1 });
      expect(args.data.actionUrl).toBe("/x");
    });

    it("defaults metadata and actionUrl to undefined/null", async () => {
      await service.create({ userId: "user-1", type: "SYSTEM", title: "t", message: "m" });

      const call = (mockPrisma.notification.create as ReturnType<typeof mock>).mock
        .calls[0] as unknown[];
      const args = call[0] as { data: { metadata: unknown; actionUrl: string | null } };
      expect(args.data.metadata).toBeUndefined();
      expect(args.data.actionUrl).toBeNull();
    });
  });

  describe("createForAllUsers", () => {
    it("creates a notification for every active user", async () => {
      const count = await service.createForAllUsers("SYSTEM", "Alert", "all hands");
      expect(count).toBe(3);
      expect(mockPrisma.notification.createMany).toHaveBeenCalled();
    });
  });

  describe("list", () => {
    it("returns paginated items", async () => {
      const result = await service.list("user-1", { page: 1, limit: 20 });
      expect(result.items).toHaveLength(1);
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it("applies unreadOnly filter", async () => {
      await service.list("user-1", { page: 1, limit: 10, unreadOnly: "true" });
      const call = (mockPrisma.notification.findMany as ReturnType<typeof mock>).mock
        .calls[0] as unknown[];
      const args = call[0] as { where: { readAt: Date | null } };
      expect(args.where.readAt).toBeNull();
    });

    it("applies type filter", async () => {
      await service.list("user-1", { page: 1, limit: 10, type: "SYSTEM" });
      const call = (mockPrisma.notification.findMany as ReturnType<typeof mock>).mock
        .calls[0] as unknown[];
      const args = call[0] as { where: { type: string } };
      expect(args.where.type).toBe("SYSTEM");
    });

    it("computes totalPages", async () => {
      (mockPrisma.notification.count as ReturnType<typeof mock>).mockResolvedValue(25);
      const result = await service.list("user-1", { page: 1, limit: 10 });
      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe("getUnreadCount", () => {
    it("returns count of unread notifications", async () => {
      (mockPrisma.notification.count as ReturnType<typeof mock>).mockResolvedValue(7);
      const count = await service.getUnreadCount("user-1");
      expect(count).toBe(7);
    });
  });

  describe("markAsRead", () => {
    it("marks specified notifications as read", async () => {
      await service.markAsRead("user-1", ["n1", "n2"]);
      const call = (mockPrisma.notification.updateMany as ReturnType<typeof mock>).mock
        .calls[0] as unknown[];
      const args = call[0] as {
        where: { id: { in: string[] }; userId: string };
        data: { readAt: Date };
      };
      expect(args.where.id.in).toEqual(["n1", "n2"]);
      expect(args.where.userId).toBe("user-1");
      expect(args.data.readAt).toBeInstanceOf(Date);
    });
  });

  describe("markAllAsRead", () => {
    it("marks all unread notifications as read", async () => {
      await service.markAllAsRead("user-1");
      const call = (mockPrisma.notification.updateMany as ReturnType<typeof mock>).mock
        .calls[0] as unknown[];
      const args = call[0] as { where: { userId: string; readAt: null } };
      expect(args.where.userId).toBe("user-1");
      expect(args.where.readAt).toBeNull();
    });
  });

  describe("delete", () => {
    it("deletes user-owned notification", async () => {
      await service.delete("user-1", "notif-1");
      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({
        where: { id: "notif-1" },
      });
    });

    it("throws NotFoundError when notification doesn't exist", () => {
      (mockPrisma.notification.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.delete("user-1", "missing")).rejects.toThrow("Notification not found");
    });

    it("throws NotFoundError when notification belongs to another user", () => {
      (mockPrisma.notification.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createNotificationRow({ userId: "other-user" }),
      );
      expect(service.delete("user-1", "notif-1")).rejects.toThrow("Notification not found");
    });
  });
});
