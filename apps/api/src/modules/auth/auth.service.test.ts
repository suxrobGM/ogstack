import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { EmailService } from "@/common/services/email.service";
import { hashPassword, verifyPassword } from "@/common/utils/password";
import { PrismaClient } from "@/generated/prisma";
import { AuthService } from "./auth.service";

mock.module("@/common/utils/password", () => ({
  hashPassword: mock(() => Promise.resolve("hashed_password_123")),
  verifyPassword: mock(() => Promise.resolve(true)),
}));

const MOCK_ACCESS_TOKEN = "mock_access_token";
const MOCK_REFRESH_TOKEN = "mock_refresh_token";

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
      return this.payload.type === "refresh" ? MOCK_REFRESH_TOKEN : MOCK_ACCESS_TOKEN;
    }
  },
  jwtVerify: mock(() =>
    Promise.resolve({
      payload: {
        sub: "user-uuid-1",
        type: "refresh",
      },
    }),
  ),
}));

const { jwtVerify } = await import("jose");

function createMockUser(overrides = {}) {
  return {
    id: "user-uuid-1",
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
    role: "USER",
    passwordHash: "hashed_password_123",
    avatarUrl: null,
    emailVerified: false,
    deletedAt: null,
    passwordResetToken: null,
    passwordResetExpiresAt: null,
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

function createMockEmailService() {
  return { send: mock(() => Promise.resolve()) } as unknown as EmailService;
}

describe("AuthService", () => {
  let authService: AuthService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockEmailService: ReturnType<typeof createMockEmailService>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    mockEmailService = createMockEmailService();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    container.registerInstance(EmailService, mockEmailService as unknown as EmailService);
    authService = container.resolve(AuthService);
  });

  describe("register", () => {
    it("should register a new user and return tokens", async () => {
      const result = await authService.register({
        email: "test@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      });

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe("test@example.com");
      expect(result.user.firstName).toBe("Test");
      expect(result.user.role).toBe("USER");
    });

    it("should throw ConflictError if email already exists", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValueOnce({
        id: "existing-user",
        email: "taken@example.com",
      });

      expect(
        authService.register({
          email: "taken@example.com",
          password: "securePassword123",
          firstName: "Test",
          lastName: "User",
        }),
      ).rejects.toThrow("email already exists");
    });

    it("should hash the password before storing", async () => {
      await authService.register({
        email: "test@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      });

      expect(hashPassword).toHaveBeenCalledWith("securePassword123");
    });

    it("should not create a default project for the new user", async () => {
      await authService.register({
        email: "test@example.com",
        password: "securePassword123",
        firstName: "Test",
        lastName: "User",
      });

      expect((mockPrisma as any).project).toBeUndefined();
    });
  });

  describe("login", () => {
    it("should login with valid credentials and return tokens", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(createMockUser());

      const result = await authService.login({
        email: "test@example.com",
        password: "securePassword123",
      });

      expect(result).toHaveProperty("user");
      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw UnauthorizedError for non-existent email", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(
        authService.login({
          email: "noone@example.com",
          password: "securePassword123",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw UnauthorizedError for wrong password", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(createMockUser());

      (verifyPassword as ReturnType<typeof mock>).mockResolvedValueOnce(false);

      expect(
        authService.login({
          email: "test@example.com",
          password: "wrongPassword",
        }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("should throw UnauthorizedError for deleted user", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ deletedAt: new Date() }),
      );

      expect(
        authService.login({
          email: "test@example.com",
          password: "securePassword123",
        }),
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("refresh", () => {
    it("should refresh tokens with a valid refresh token", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(createMockUser());

      const result = await authService.refresh("valid_refresh_token");

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(result).toHaveProperty("user");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw UnauthorizedError for invalid refresh token", () => {
      (jwtVerify as ReturnType<typeof mock>).mockRejectedValueOnce(new Error("invalid token"));

      expect(authService.refresh("invalid_token")).rejects.toThrow(
        "Invalid or expired refresh token",
      );
    });

    it("should throw UnauthorizedError for non-refresh token type", () => {
      (jwtVerify as ReturnType<typeof mock>).mockResolvedValueOnce({
        payload: { sub: "user-uuid-1", type: "access" },
      });

      expect(authService.refresh("access_token_as_refresh")).rejects.toThrow(
        "Invalid or expired refresh token",
      );
    });

    it("should throw UnauthorizedError for deleted user", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ deletedAt: new Date() }),
      );

      expect(authService.refresh("valid_refresh_token")).rejects.toThrow(
        "Invalid or expired refresh token",
      );
    });
  });

  describe("forgotPassword", () => {
    it("should send reset email for existing user", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(createMockUser());

      await authService.forgotPassword({ email: "test@example.com" });

      expect(mockPrisma.user.update).toHaveBeenCalled();
      expect(mockEmailService.send).toHaveBeenCalled();
    });

    it("should not throw for non-existent email", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      await authService.forgotPassword({ email: "noone@example.com" });

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.send).not.toHaveBeenCalled();
    });

    it("should not send email for OAuth-only user without password", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ passwordHash: null }),
      );

      await authService.forgotPassword({ email: "test@example.com" });

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.send).not.toHaveBeenCalled();
    });

    it("should not send email for deleted user", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ deletedAt: new Date() }),
      );

      await authService.forgotPassword({ email: "test@example.com" });

      expect(mockPrisma.user.update).not.toHaveBeenCalled();
      expect(mockEmailService.send).not.toHaveBeenCalled();
    });
  });

  describe("resetPassword", () => {
    it("should reset password with valid token", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({
          passwordResetToken: "valid_token",
          passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        }),
      );

      await authService.resetPassword({ token: "valid_token", password: "newPassword123" });

      expect(hashPassword).toHaveBeenCalledWith("newPassword123");
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it("should throw BadRequestError for invalid token", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(
        authService.resetPassword({ token: "bad_token", password: "newPassword123" }),
      ).rejects.toThrow("Invalid or expired reset token");
    });

    it("should throw BadRequestError for expired token", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({
          passwordResetToken: "expired_token",
          passwordResetExpiresAt: new Date(Date.now() - 1000),
        }),
      );

      expect(
        authService.resetPassword({ token: "expired_token", password: "newPassword123" }),
      ).rejects.toThrow("Invalid or expired reset token");
    });

    it("should clear reset token after successful reset", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({
          passwordResetToken: "valid_token",
          passwordResetExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
        }),
      );

      await authService.resetPassword({ token: "valid_token", password: "newPassword123" });

      const updateCall = (mockPrisma.user.update as ReturnType<typeof mock>).mock.calls[0];
      const updateData = (updateCall as unknown[])[0] as { data: Record<string, unknown> };
      expect(updateData.data.passwordResetToken).toBeNull();
      expect(updateData.data.passwordResetExpiresAt).toBeNull();
    });
  });
});
