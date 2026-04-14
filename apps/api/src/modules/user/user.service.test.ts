import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { UserService } from "./user.service";

function createMockUser(overrides = {}) {
  return {
    id: "user-uuid-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "USER",
    plan: "FREE",
    avatarUrl: null,
    emailVerified: false,
    passwordHash: "hashed_password_123",
    githubId: null,
    googleId: null,
    deletedAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    user: {
      findUnique: mock(() => Promise.resolve(createMockUser())),
      update: mock(() => Promise.resolve(createMockUser())),
    },
  } as unknown as PrismaClient;
}

describe("UserService", () => {
  let service: UserService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    service = container.resolve(UserService);
  });

  describe("getProfile", () => {
    it("should return user profile", async () => {
      const result = await service.getProfile("user-uuid-1");

      expect(result).toEqual({
        id: "user-uuid-1",
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
        role: "USER",
        plan: "FREE",
        avatarUrl: null,
        emailVerified: false,
        hasPassword: true,
        githubConnected: false,
        googleConnected: false,
        createdAt: new Date("2026-01-01"),
      });
    });

    it("should throw NotFoundError when user does not exist", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.getProfile("nonexistent")).rejects.toThrow("User not found");
    });

    it("should throw NotFoundError for soft-deleted user", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.getProfile("deleted-user")).rejects.toThrow("User not found");
    });
  });

  describe("updateProfile", () => {
    it("should update and return the profile", async () => {
      const updated = createMockUser({ firstName: "Updated" });
      (mockPrisma.user.update as ReturnType<typeof mock>).mockResolvedValue(updated);

      const result = await service.updateProfile("user-uuid-1", { firstName: "Updated" });

      expect(result.firstName).toBe("Updated");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-uuid-1" },
        data: { firstName: "Updated" },
      });
    });
  });
});
