import { Plan } from "@ogstack/shared";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { AdminService } from "./admin.service";

function createMockUser(overrides = {}) {
  return {
    id: "user-uuid-1",
    email: "user@example.com",
    name: "Test User",
    role: "USER",
    plan: Plan.FREE,
    avatarUrl: null,
    emailVerified: true,
    suspended: false,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    user: {
      findMany: mock(() => Promise.resolve([createMockUser()])),
      findUnique: mock(() => Promise.resolve(createMockUser())),
      count: mock(() => Promise.resolve(1)),
      update: mock(() => Promise.resolve(createMockUser())),
    },
    auditLog: {
      create: mock(() => Promise.resolve({ id: "log-1" })),
    },
  } as unknown as PrismaClient;
}

describe("AdminService", () => {
  let service: AdminService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    service = container.resolve(AdminService);
  });

  describe("listUsers", () => {
    it("should return paginated user list", async () => {
      const result = await service.listUsers({ page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.email).toBe("user@example.com");
      expect(result.pagination).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it("should pass search filter to query", async () => {
      await service.listUsers({ page: 1, limit: 20, search: "test" });

      const call = (mockPrisma.user.findMany as ReturnType<typeof mock>).mock.calls[0] as any[];
      expect(call[0].where.OR).toBeDefined();
    });

    it("should filter by plan", async () => {
      await service.listUsers({ page: 1, limit: 20, plan: "PRO" });

      const call = (mockPrisma.user.findMany as ReturnType<typeof mock>).mock.calls[0] as any[];
      expect(call[0].where.plan).toBe("PRO");
    });

    it("should filter by suspended status", async () => {
      await service.listUsers({ page: 1, limit: 20, status: "suspended" });

      const call = (mockPrisma.user.findMany as ReturnType<typeof mock>).mock.calls[0] as any[];
      expect(call[0].where.suspended).toBe(true);
    });

    it("should filter by active status", async () => {
      await service.listUsers({ page: 1, limit: 20, status: "active" });

      const call = (mockPrisma.user.findMany as ReturnType<typeof mock>).mock.calls[0] as any[];
      expect(call[0].where.suspended).toBe(false);
    });

    it("should calculate correct pagination", async () => {
      (mockPrisma.user.count as ReturnType<typeof mock>).mockResolvedValue(45);

      const result = await service.listUsers({ page: 2, limit: 20 });

      expect(result.pagination.totalPages).toBe(3);
      const call = (mockPrisma.user.findMany as ReturnType<typeof mock>).mock.calls[0] as any[];
      expect(call[0].skip).toBe(20);
    });
  });

  describe("getUserDetail", () => {
    it("should return user detail with related data", async () => {
      const userWithRelations = {
        ...createMockUser(),
        projects: [
          { id: "p1", name: "Proj", publicId: "abc123", isActive: true, createdAt: new Date() },
        ],
        apiKeys: [],
        usageRecords: [],
      };
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(userWithRelations);

      const result = await service.getUserDetail("user-uuid-1");

      expect(result.projects).toHaveLength(1);
      expect(result.email).toBe("user@example.com");
    });

    it("should throw NotFoundError when user not found", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.getUserDetail("nonexistent")).rejects.toThrow("User not found");
    });
  });

  describe("updateUserPlan", () => {
    it("should update plan and create audit log", async () => {
      const updated = createMockUser({ plan: "PRO", updatedAt: new Date() });
      (mockPrisma.user.update as ReturnType<typeof mock>).mockResolvedValue(updated);

      const result = await service.updateUserPlan(
        "user-uuid-1",
        { plan: "PRO" },
        "admin-1",
        "ADMIN" as any,
      );

      expect(result.plan).toBe("PRO");
      expect(mockPrisma.auditLog.create).toHaveBeenCalled();
      const logCall = (mockPrisma.auditLog.create as ReturnType<typeof mock>).mock
        .calls[0] as any[];
      expect(logCall[0].data.action).toBe("UPDATE_USER_PLAN");
    });

    it("should throw NotFoundError when user not found", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(
        service.updateUserPlan("nonexistent", { plan: "PRO" }, "admin-1", "ADMIN" as any),
      ).rejects.toThrow("User not found");
    });

    it("should throw BadRequestError when plan is the same", () => {
      expect(
        service.updateUserPlan("user-uuid-1", { plan: Plan.FREE }, "admin-1", "ADMIN" as any),
      ).rejects.toThrow("already on the FREE plan");
    });
  });

  describe("suspendUser", () => {
    it("should suspend user and create audit log", async () => {
      const updated = createMockUser({ suspended: true, updatedAt: new Date() });
      (mockPrisma.user.update as ReturnType<typeof mock>).mockResolvedValue(updated);

      const result = await service.suspendUser(
        "user-uuid-1",
        { suspend: true },
        "admin-1",
        "ADMIN" as any,
      );

      expect(result.suspended).toBe(true);
      const logCall = (mockPrisma.auditLog.create as ReturnType<typeof mock>).mock
        .calls[0] as any[];
      expect(logCall[0].data.action).toBe("SUSPEND_USER");
    });

    it("should unsuspend user", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ suspended: true }),
      );
      const updated = createMockUser({ suspended: false, updatedAt: new Date() });
      (mockPrisma.user.update as ReturnType<typeof mock>).mockResolvedValue(updated);

      const result = await service.suspendUser(
        "user-uuid-1",
        { suspend: false },
        "admin-1",
        "ADMIN" as any,
      );

      expect(result.suspended).toBe(false);
      const logCall = (mockPrisma.auditLog.create as ReturnType<typeof mock>).mock
        .calls[0] as any[];
      expect(logCall[0].data.action).toBe("UNSUSPEND_USER");
    });

    it("should throw BadRequestError if already suspended", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ suspended: true }),
      );

      expect(
        service.suspendUser("user-uuid-1", { suspend: true }, "admin-1", "ADMIN" as any),
      ).rejects.toThrow("already suspended");
    });

    it("should throw BadRequestError if not suspended", () => {
      expect(
        service.suspendUser("user-uuid-1", { suspend: false }, "admin-1", "ADMIN" as any),
      ).rejects.toThrow("not suspended");
    });

    it("should throw NotFoundError when user not found", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(
        service.suspendUser("nonexistent", { suspend: true }, "admin-1", "ADMIN" as any),
      ).rejects.toThrow("User not found");
    });
  });
});
