import { SignJWT } from "jose";
import { injectable } from "tsyringe";
import { ConflictError, UnauthorizedError } from "@/common/errors";
import { generatePublicId, generateRandomToken } from "@/common/utils/crypto";
import { hashPassword, verifyPassword } from "@/common/utils/password";
import { PrismaClient } from "@/generated/prisma";
import type { AuthResponse, LoginBody, RefreshBody, RegisterBody } from "./auth.schema";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");
const JWT_EXPIRY = process.env.JWT_EXPIRY ?? "7d";

type TransactionClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

@injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Register a new user, create a default project, and return auth tokens. */
  async register(data: RegisterBody): Promise<AuthResponse> {
    const { email, password, name } = data;

    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.user.findUnique({ where: { email } });
      if (existing) {
        throw new ConflictError("A user with this email already exists");
      }

      const passwordHash = await hashPassword(password);

      const user = await tx.user.create({
        data: { email, passwordHash, name },
      });

      await tx.project.create({
        data: {
          userId: user.id,
          publicId: generatePublicId(),
          name: "Default Project",
        },
      });

      return this.buildAuthResponse(user, tx);
    });
  }

  /** Authenticate a user by email and password. */
  async login(data: LoginBody): Promise<AuthResponse> {
    const { email, password } = data;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt || !user.passwordHash) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    return this.buildAuthResponse(user, this.prisma);
  }

  /** Exchange a valid refresh token for new access + refresh tokens. */
  async refresh(data: RefreshBody): Promise<AuthResponse> {
    const record = await this.prisma.refreshToken.findFirst({
      where: {
        token: data.refreshToken,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!record || record.user.deletedAt) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    await this.prisma.refreshToken.update({
      where: { id: record.id },
      data: { revokedAt: new Date() },
    });

    return this.buildAuthResponse(record.user, this.prisma);
  }

  /** Revoke a refresh token. */
  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  private async buildAuthResponse(
    user: { id: string; email: string; name: string; role: string },
    client: TransactionClient,
  ): Promise<AuthResponse> {
    const accessToken = await this.generateAccessToken(user);
    const refreshTokenRecord = await this.createRefreshToken(client, user.id);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken: refreshTokenRecord.token,
    };
  }

  private async generateAccessToken(user: {
    id: string;
    role: string;
    email: string;
  }): Promise<string> {
    return new SignJWT({ role: user.role, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(user.id)
      .setExpirationTime(JWT_EXPIRY)
      .sign(JWT_SECRET);
  }

  private async createRefreshToken(client: TransactionClient, userId: string) {
    const token = generateRandomToken();
    const expiryDays = parseRefreshTokenExpiryDays();
    const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

    return client.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }
}

function parseRefreshTokenExpiryDays(): number {
  const raw: string = process.env.REFRESH_TOKEN_EXPIRY ?? "30d";
  const match = raw.match(/^(\d+)d?$/);
  return match?.[1] ? parseInt(match[1], 10) : 30;
}
