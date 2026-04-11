import { Plan } from "@ogstack/shared";
import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { OAuthUserService, type OAuthProfile } from "./oauth-user.service";

mock.module("jose", () => ({
  SignJWT: class MockSignJWT {
    setProtectedHeader() {
      return this;
    }
    setSubject() {
      return this;
    }
    setExpirationTime() {
      return this;
    }
    async sign() {
      return "mock_token";
    }
  },
  jwtVerify: mock(() => Promise.resolve({ payload: {} })),
}));

const githubProfile: OAuthProfile = {
  id: "gh-123",
  email: "oauth@example.com",
  firstName: "OAuth",
  lastName: "User",
  avatarUrl: "https://example.com/avatar.png",
};

function createMockUser(overrides = {}) {
  return {
    id: "user-uuid-1",
    email: "oauth@example.com",
    firstName: "OAuth",
    lastName: "User",
    role: "USER",
    plan: Plan.FREE,
    avatarUrl: "https://example.com/avatar.png",
    emailVerified: true,
    githubId: "gh-123",
    googleId: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    user: {
      findUnique: mock(() => Promise.resolve(null)),
      create: mock(() => Promise.resolve(createMockUser())),
      update: mock(() => Promise.resolve(createMockUser())),
    },
  } as unknown as PrismaClient;
}

describe("OAuthUserService", () => {
  let service: OAuthUserService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    service = container.resolve(OAuthUserService);
  });

  describe("findOrCreateUser", () => {
    it("should return auth response for existing user by provider ID", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValueOnce(
        createMockUser(),
      );

      const result = await service.findOrCreateUser("github", githubProfile);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe("oauth@example.com");
    });

    it("should throw for deactivated user found by provider ID", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValueOnce(
        createMockUser({ deletedAt: new Date() }),
      );

      expect(service.findOrCreateUser("github", githubProfile)).rejects.toThrow("deactivated");
    });

    it("should link provider to existing user found by email", async () => {
      // First findUnique (by provider ID) returns null
      (mockPrisma.user.findUnique as ReturnType<typeof mock>)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createMockUser({ githubId: null }));

      const result = await service.findOrCreateUser("github", githubProfile);

      expect(result.user.email).toBe("oauth@example.com");
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it("should throw for deactivated user found by email", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(createMockUser({ deletedAt: new Date() }));

      expect(service.findOrCreateUser("github", githubProfile)).rejects.toThrow("deactivated");
    });

    it("should create a new user when no match", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await service.findOrCreateUser("github", githubProfile);

      expect(result).toHaveProperty("accessToken");
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it("should update avatar if changed for existing provider user", async () => {
      const existingUser = createMockUser({ avatarUrl: "https://old-avatar.com" });
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValueOnce(existingUser);

      await service.findOrCreateUser("github", {
        ...githubProfile,
        avatarUrl: "https://new-avatar.com",
      });

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it("should work with google provider", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await service.findOrCreateUser("google", {
        ...githubProfile,
        id: "google-456",
      });

      expect(result).toHaveProperty("accessToken");
    });
  });
});
