import { singleton } from "tsyringe";
import { EmailChangedEmail } from "@/common/emails/templates/email-changed";
import { PasswordChangedEmail } from "@/common/emails/templates/password-changed";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "@/common/errors";
import { EmailService } from "@/common/services/email.service";
import { generateRandomToken } from "@/common/utils/crypto";
import { hashPassword, verifyPassword } from "@/common/utils/password";
import { Plan, PrismaClient } from "@/generated/prisma";
import type {
  ChangeEmailBody,
  ChangePasswordBody,
  UpdateProfileBody,
  UserProfile,
} from "./user.schema";

const WEBSITE_URL = process.env.WEBSITE_URL ?? "http://localhost:4001";
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

@singleton()
export class UserService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly emailService: EmailService,
  ) {}

  /** Get a user's public profile by ID. */
  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return this.toProfile(user);
  }

  /** Update a user's profile. */
  async updateProfile(userId: string, data: UpdateProfileBody): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data,
    });

    return this.toProfile(user);
  }

  /** Change the authenticated user's password. */
  async changePassword(userId: string, data: ChangePasswordBody): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    if (!user.passwordHash) {
      throw new ForbiddenError("Cannot change password for OAuth-only accounts");
    }

    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestError("New password and confirmation do not match");
    }

    if (data.currentPassword === data.newPassword) {
      throw new BadRequestError("New password must be different from current password");
    }

    const newHash = await hashPassword(data.newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    void this.emailService.send({
      to: user.email,
      subject: "Your OGStack password was changed",
      react: PasswordChangedEmail({ name: user.firstName }),
    });

    return { message: "Password changed successfully" };
  }

  /** Change the authenticated user's email address. */
  async changeEmail(userId: string, data: ChangeEmailBody): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    if (user.passwordHash) {
      const valid = await verifyPassword(data.password, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedError("Password is incorrect");
      }
    }

    const existing = await this.prisma.user.findUnique({ where: { email: data.newEmail } });
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        email: data.newEmail,
        emailVerified: false,
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    const verifyUrl = `${WEBSITE_URL}/verify-email?token=${token}`;
    void this.emailService.send({
      to: data.newEmail,
      subject: "Verify your new OGStack email",
      react: EmailChangedEmail({
        name: updated.firstName,
        newEmail: data.newEmail,
        verifyUrl,
      }),
    });

    return this.toProfile(updated);
  }

  /** Unlink an OAuth provider from the user's account. */
  async unlinkProvider(userId: string, provider: "github" | "google"): Promise<UserProfile> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User not found");

    const providerField = provider === "github" ? "githubId" : "googleId";
    if (!user[providerField]) {
      throw new BadRequestError(`${provider} account is not connected`);
    }

    const otherProvider = provider === "github" ? "googleId" : "githubId";
    const hasOtherAuth = !!user.passwordHash || !!user[otherProvider];
    if (!hasOtherAuth) {
      throw new BadRequestError("Cannot unlink your only authentication method");
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { [providerField]: null },
    });

    return this.toProfile(updated);
  }

  /** Permanently delete the user's account and all associated data. */
  async deleteAccount(userId: string): Promise<{ message: string }> {
    await this.prisma.$transaction(async (tx) => {
      await tx.auditLog.deleteMany({ where: { actorId: userId } });
      await tx.auditReport.deleteMany({ where: { userId } });
      await tx.user.delete({ where: { id: userId } });
    });

    return { message: "Account deleted successfully" };
  }

  private toProfile(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    plan: Plan;
    avatarUrl: string | null;
    emailVerified: boolean;
    passwordHash?: string | null;
    githubId?: string | null;
    googleId?: string | null;
    createdAt: Date;
  }): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      plan: user.plan,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      hasPassword: !!user.passwordHash,
      githubConnected: !!user.githubId,
      googleConnected: !!user.googleId,
      createdAt: user.createdAt,
    };
  }
}
