import { singleton } from "tsyringe";
import { EmailVerificationEmail } from "@/common/emails/templates/email-verification";
import { PasswordResetEmail } from "@/common/emails/templates/password-reset";
import { BadRequestError, ConflictError, UnauthorizedError } from "@/common/errors";
import { EmailService } from "@/common/services/email.service";
import { RecaptchaService } from "@/common/services/recaptcha.service";
import { generateRandomToken } from "@/common/utils/crypto";
import { buildAuthResponse, verifyToken } from "@/common/utils/jwt";
import { hashPassword, verifyPassword } from "@/common/utils/password";
import { PrismaClient } from "@/generated/prisma";
import type {
  AuthResponse,
  ForgotPasswordBody,
  LoginBody,
  RegisterBody,
  RegisterResponse,
  ResendVerificationBody,
  ResetPasswordBody,
  VerifyEmailBody,
} from "./auth.schema";

const WEBSITE_URL = process.env.WEBSITE_URL ?? "http://localhost:4001";
const PASSWORD_RESET_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const EMAIL_VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

@singleton()
export class AuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly emailService: EmailService,
    private readonly recaptcha: RecaptchaService,
  ) {}

  /**
   * Register a new user. Sends a verification email and does NOT log the user
   * in — tokens are only issued after the email has been verified.
   */
  async register(data: RegisterBody): Promise<RegisterResponse> {
    await this.recaptcha.verify(data.recaptchaToken, "register");

    const { email, password, firstName, lastName } = data;
    const trimmedEmail = email.trim();

    const existing = await this.prisma.user.findFirst({
      where: { email: { equals: trimmedEmail, mode: "insensitive" } },
    });
    if (existing) {
      throw new ConflictError("A user with this email already exists");
    }

    const passwordHash = await hashPassword(password);

    const user = await this.prisma.user.create({
      data: { email: trimmedEmail.toLowerCase(), passwordHash, firstName, lastName },
    });

    await this.sendVerificationEmail(user.id);

    return {
      message: "Account created. Please check your email to verify your address before signing in.",
      email: user.email,
    };
  }

  /** Authenticate a user by email and password. */
  async login(data: LoginBody): Promise<AuthResponse> {
    await this.recaptcha.verify(data.recaptchaToken, "login");

    const { email, password } = data;

    const user = await this.prisma.user.findFirst({
      where: { email: { equals: email.trim(), mode: "insensitive" } },
    });
    if (!user || user.deletedAt || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.emailVerified) {
      throw new UnauthorizedError(
        "Please verify your email address before signing in. Check your inbox for the verification link.",
      );
    }

    return buildAuthResponse(user);
  }

  /** Exchange a valid refresh token for new access + refresh tokens. */
  async refresh(refreshToken: string): Promise<AuthResponse> {
    let payload;
    try {
      payload = await verifyToken(refreshToken);
    } catch {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    if (payload.type !== "refresh") {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub as string },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    return buildAuthResponse(user);
  }

  /** Generate a password reset token and send reset email. */
  async forgotPassword(data: ForgotPasswordBody): Promise<void> {
    await this.recaptcha.verify(data.recaptchaToken, "forgot_password");

    const user = await this.prisma.user.findUnique({ where: { email: data.email } });

    // Always return success to prevent email enumeration
    if (!user || user.deletedAt || !user.passwordHash) return;

    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MS);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: token, passwordResetExpiresAt: expiresAt },
    });

    const resetUrl = `${WEBSITE_URL}/reset-password?token=${token}`;

    await this.emailService.send({
      to: user.email,
      subject: "Reset your OGStack password",
      react: PasswordResetEmail({ name: user.firstName, resetUrl }),
    });
  }

  /** Validate the reset token and set the new password. */
  async resetPassword(data: ResetPasswordBody): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { passwordResetToken: data.token },
    });

    if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const passwordHash = await hashPassword(data.password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpiresAt: null,
      },
    });
  }

  /** Send a verification email to the user. */
  async sendVerificationEmail(userId: string): Promise<void> {
    const token = generateRandomToken();
    const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_EXPIRY_MS);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerificationToken: token, emailVerificationExpiresAt: expiresAt },
    });

    const verifyUrl = `${WEBSITE_URL}/verify-email?token=${token}`;

    await this.emailService.send({
      to: user.email,
      subject: "Verify your OGStack email",
      react: EmailVerificationEmail({ name: user.firstName, verifyUrl }),
    });
  }

  /** Verify the email using the token. */
  async verifyEmail(data: VerifyEmailBody): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { emailVerificationToken: data.token },
    });

    if (!user || !user.emailVerificationExpiresAt || user.emailVerificationExpiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired verification token");
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
    });
  }

  /** Resend the verification email. */
  async resendVerification(data: ResendVerificationBody): Promise<void> {
    await this.recaptcha.verify(data.recaptchaToken, "resend_verification");

    const user = await this.prisma.user.findUnique({ where: { email: data.email } });

    // Always return success to prevent email enumeration
    if (!user || user.deletedAt || user.emailVerified) return;

    await this.sendVerificationEmail(user.id);
  }
}
