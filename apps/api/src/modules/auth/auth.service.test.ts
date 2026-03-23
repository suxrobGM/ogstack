import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { hashPassword, verifyPassword } from "@/common/utils/password";
import { PrismaClient } from "@/generated/prisma";
import { AuthService } from "./auth.service";

// Mock password utils
mock.module("@/common/utils/password", () => ({
  hashPassword: mock(() => Promise.resolve("hashed_password_123")),
  verifyPassword: mock(() => Promise.resolve(true)),
}));

// Mock jose JWT signing
mock.module("jose", () => ({
  SignJWT: class MockSignJWT {
    private payload: Record<string, unknown>;
    constructor(payload: Record<string, unknown>) {
      this.payload = payload;
    }
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
      return "mock_access_token";
    }
  },
}));

function createMockPrisma() {
  return {
    user: {
      findUnique: mock(() => Promise.resolve(null)),
      create: mock(() =>
        Promise.resolve({
          id: "user-uuid-1",
          email: "test@example.com",
          name: "Test User",
          role: "USER",
          passwordHash: "hashed_password_123",
          avatarUrl: null,
          emailVerified: false,
          deletedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    },
    refreshToken: {
      create: mock(() =>
        Promise.resolve({
          id: "rt-uuid-1",
          userId: "user-uuid-1",
          token: "mock_refresh_token",
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          revokedAt: null,
          createdAt: new Date(),
        }),
      ),
    },
    project: {
      create: mock(() =>
        Promise.resolve({
          id: "proj-uuid-1",
          userId: "user-uuid-1",
          publicId: "abc12345",
          name: "Default Project",
          domains: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      ),
    },
    $transaction: mock((fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        user: {
          findUnique: mock(() => Promise.resolve(null)),
          create: mock(() =>
            Promise.resolve({
              id: "user-uuid-1",
              email: "test@example.com",
              name: "Test User",
              role: "USER",
              passwordHash: "hashed_password_123",
              avatarUrl: null,
              emailVerified: false,
              deletedAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          ),
        },
        refreshToken: {
          create: mock(() =>
            Promise.resolve({
              id: "rt-uuid-1",
              userId: "user-uuid-1",
              token: "mock_refresh_token",
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              revokedAt: null,
              createdAt: new Date(),
            }),
          ),
        },
        project: {
          create: mock(() =>
            Promise.resolve({
              id: "proj-uuid-1",
              userId: "user-uuid-1",
              publicId: "abc12345",
              name: "Default Project",
              domains: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            }),
          ),
        },
      };
      return fn(tx);
    }),
  } as unknown as PrismaClient;
}

describe("AuthService", () => {
  let authService: AuthService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    authService = container.resolve(AuthService);
  });

  describe("register", () => {
    it("should register a new user and return tokens", async () => {
      const result = await authService.register({
        email: "test@example.com",
        password: "securePassword123",
        name: "Test User",
      });

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.name).toBe("Test User");
      expect(result.user.role).toBe("USER");
    });

    it("should throw ConflictError if email already exists", async () => {
      (mockPrisma.$transaction as ReturnType<typeof mock>).mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            user: {
              findUnique: mock(() =>
                Promise.resolve({
                  id: "existing-user",
                  email: "taken@example.com",
                }),
              ),
            },
          };
          return fn(tx);
        },
      );

      await expect(
        authService.register({
          email: "taken@example.com",
          password: "securePassword123",
          name: "Test User",
        }),
      ).rejects.toThrow("email already exists");
    });

    it("should hash the password before storing", async () => {
      await authService.register({
        email: "test@example.com",
        password: "securePassword123",
        name: "Test User",
      });

      expect(hashPassword).toHaveBeenCalledWith("securePassword123");
    });

    it("should create a default project for the new user", async () => {
      let projectCreated = false;
      (mockPrisma.$transaction as ReturnType<typeof mock>).mockImplementation(
        (fn: (tx: unknown) => Promise<unknown>) => {
          const tx = {
            user: {
              findUnique: mock(() => Promise.resolve(null)),
              create: mock(() =>
                Promise.resolve({
                  id: "user-uuid-1",
                  email: "test@example.com",
                  name: "Test User",
                  role: "USER",
                }),
              ),
            },
            refreshToken: {
              create: mock(() =>
                Promise.resolve({
                  id: "rt-uuid-1",
                  token: "mock_refresh_token",
                }),
              ),
            },
            project: {
              create: mock(() => {
                projectCreated = true;
                return Promise.resolve({
                  id: "proj-uuid-1",
                  publicId: "abc12345",
                  name: "Default Project",
                });
              }),
            },
          };
          return fn(tx);
        },
      );

      await authService.register({
        email: "test@example.com",
        password: "securePassword123",
        name: "Test User",
      });

      expect(projectCreated).toBe(true);
    });
  });
});
