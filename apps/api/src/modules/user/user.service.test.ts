import { afterAll, beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { EmailService } from "@/common/services/email.service";
import { PrismaClient } from "@/generated/prisma";
import { restoreMockedModules } from "@/test/setup";
import { UserService } from "./user.service";

afterAll(() => restoreMockedModules("@/common/utils/password"));

mock.module("@/common/utils/password", () => ({
  hashPassword: mock(() => Promise.resolve("new_hashed_password")),
  verifyPassword: mock(() => Promise.resolve(true)),
}));

const { verifyPassword } = await import("@/common/utils/password");

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
    emailVerificationToken: null,
    emailVerificationExpiresAt: null,
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
      delete: mock(() => Promise.resolve(createMockUser())),
    },
    auditLog: { deleteMany: mock(() => Promise.resolve({ count: 0 })) },
    auditReport: { deleteMany: mock(() => Promise.resolve({ count: 0 })) },
    $transaction: mock(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        auditLog: { deleteMany: mock(() => Promise.resolve({ count: 0 })) },
        auditReport: { deleteMany: mock(() => Promise.resolve({ count: 0 })) },
        user: { delete: mock(() => Promise.resolve(createMockUser())) },
      }),
    ),
  } as unknown as PrismaClient;
}

function createMockEmailService() {
  return {
    send: mock(() => Promise.resolve()),
  } as unknown as EmailService;
}

describe("UserService", () => {
  let service: UserService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;
  let mockEmail: ReturnType<typeof createMockEmailService>;

  beforeEach(() => {
    (verifyPassword as ReturnType<typeof mock>).mockResolvedValue(true);
    container.clearInstances();
    mockPrisma = createMockPrisma();
    mockEmail = createMockEmailService();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    container.registerInstance(EmailService, mockEmail as unknown as EmailService);
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

    it("reports oauth providers when linked", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ githubId: "gh-1", googleId: "go-1", passwordHash: null }),
      );
      const result = await service.getProfile("user-uuid-1");
      expect(result.hasPassword).toBe(false);
      expect(result.githubConnected).toBe(true);
      expect(result.googleConnected).toBe(true);
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

  describe("changePassword", () => {
    const body = {
      currentPassword: "oldPass123",
      newPassword: "newPass456",
      confirmPassword: "newPass456",
    };

    it("changes password and sends notification email", async () => {
      const result = await service.changePassword("user-uuid-1", body);

      expect(result.message).toBe("Password changed successfully");
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: "user-uuid-1" },
        data: { passwordHash: "new_hashed_password" },
      });
      expect(mockEmail.send).toHaveBeenCalled();
    });

    it("throws NotFoundError when user doesn't exist", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.changePassword("nonexistent", body)).rejects.toThrow("User not found");
    });

    it("throws ForbiddenError for OAuth-only accounts (no password hash)", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ passwordHash: null }),
      );
      expect(service.changePassword("user-uuid-1", body)).rejects.toThrow(
        "Cannot change password for OAuth-only accounts",
      );
    });

    it("throws UnauthorizedError when current password is wrong", () => {
      (verifyPassword as ReturnType<typeof mock>).mockResolvedValueOnce(false);
      expect(service.changePassword("user-uuid-1", body)).rejects.toThrow(
        "Current password is incorrect",
      );
    });

    it("throws BadRequestError when confirmation does not match", () => {
      expect(
        service.changePassword("user-uuid-1", { ...body, confirmPassword: "different" }),
      ).rejects.toThrow("New password and confirmation do not match");
    });

    it("throws BadRequestError when new password equals current", () => {
      expect(
        service.changePassword("user-uuid-1", {
          currentPassword: "samePass",
          newPassword: "samePass",
          confirmPassword: "samePass",
        }),
      ).rejects.toThrow("New password must be different from current password");
    });
  });

  describe("changeEmail", () => {
    const body = { newEmail: "new@example.com", password: "pass" };

    it("updates email, marks unverified, sends verification email", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>)
        .mockResolvedValueOnce(createMockUser())
        .mockResolvedValueOnce(null);
      (mockPrisma.user.update as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ email: "new@example.com", emailVerified: false }),
      );

      const result = await service.changeEmail("user-uuid-1", body);

      expect(result.email).toBe("new@example.com");
      expect(result.emailVerified).toBe(false);
      expect(mockEmail.send).toHaveBeenCalled();
    });

    it("throws NotFoundError when user doesn't exist", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.changeEmail("nonexistent", body)).rejects.toThrow("User not found");
    });

    it("throws UnauthorizedError when password is wrong", () => {
      (verifyPassword as ReturnType<typeof mock>).mockResolvedValueOnce(false);
      expect(service.changeEmail("user-uuid-1", body)).rejects.toThrow("Password is incorrect");
    });

    it("throws ConflictError when new email is already taken", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>)
        .mockResolvedValueOnce(createMockUser())
        .mockResolvedValueOnce(createMockUser({ id: "other", email: "new@example.com" }));

      expect(service.changeEmail("user-uuid-1", body)).rejects.toThrow(
        "A user with this email already exists",
      );
    });

    it("skips password verification for OAuth-only accounts", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>)
        .mockResolvedValueOnce(createMockUser({ passwordHash: null }))
        .mockResolvedValueOnce(null);
      (mockPrisma.user.update as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ email: "new@example.com", passwordHash: null }),
      );

      const result = await service.changeEmail("user-uuid-1", body);
      expect(result.email).toBe("new@example.com");
    });
  });

  describe("unlinkProvider", () => {
    it("unlinks github when password exists", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ githubId: "gh-1" }),
      );
      (mockPrisma.user.update as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ githubId: null }),
      );

      const result = await service.unlinkProvider("user-uuid-1", "github");
      expect(result.githubConnected).toBe(false);
    });

    it("unlinks google when github still linked", async () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ passwordHash: null, githubId: "gh-1", googleId: "go-1" }),
      );
      (mockPrisma.user.update as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ passwordHash: null, githubId: "gh-1", googleId: null }),
      );

      const result = await service.unlinkProvider("user-uuid-1", "google");
      expect(result.googleConnected).toBe(false);
    });

    it("throws NotFoundError when user doesn't exist", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);
      expect(service.unlinkProvider("nonexistent", "github")).rejects.toThrow("User not found");
    });

    it("throws BadRequestError when provider isn't linked", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ githubId: null }),
      );
      expect(service.unlinkProvider("user-uuid-1", "github")).rejects.toThrow(
        "github account is not connected",
      );
    });

    it("throws BadRequestError when unlinking would remove last auth method", () => {
      (mockPrisma.user.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockUser({ passwordHash: null, githubId: "gh-1", googleId: null }),
      );
      expect(service.unlinkProvider("user-uuid-1", "github")).rejects.toThrow(
        "Cannot unlink your only authentication method",
      );
    });
  });

  describe("deleteAccount", () => {
    it("runs a deletion transaction and returns a success message", async () => {
      const result = await service.deleteAccount("user-uuid-1");
      expect(result.message).toBe("Account deleted successfully");
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
