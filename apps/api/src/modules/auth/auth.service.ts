import { SignJWT } from "jose";
import { injectable } from "tsyringe";
import { ConflictError, UnauthorizedError } from "@/common/errors";
import { hashPassword, verifyPassword } from "@/common/utils/password";
import { PrismaClient } from "@/generated/prisma";
import type { AuthResponse, LoginBody, RegisterBody } from "./auth.schema";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET ?? "dev-secret");
const JWT_EXPIRY = process.env.JWT_EXPIRY ?? "7d";
const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY ?? "30", 10);

@injectable()
export class AuthService {
  constructor(private prisma: PrismaClient) {}

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

      const publicId = this.generatePublicId();
      await tx.project.create({
        data: {
          userId: user.id,
          publicId,
          name: "Default Project",
        },
      });

      const accessToken = await this.generateAccessToken(user);
      const refreshTokenRecord = await this.createRefreshToken(tx, user.id);

      return {
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
        accessToken,
        refreshToken: refreshTokenRecord.token,
      };
    });
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

  private async createRefreshToken(
    tx: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0],
    userId: string,
  ) {
    const token = this.generateRandomToken();
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    return tx.refreshToken.create({
      data: { userId, token, expiresAt },
    });
  }

  private generatePublicId(): string {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }

  private generateRandomToken(): string {
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
