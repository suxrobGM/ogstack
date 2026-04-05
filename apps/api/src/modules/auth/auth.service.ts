import { injectable } from "tsyringe";
import { ConflictError, UnauthorizedError } from "@/common/errors";
import { generatePublicId } from "@/common/utils/crypto";
import { generateAccessToken, generateRefreshToken, verifyToken } from "@/common/utils/jwt";
import { hashPassword, verifyPassword } from "@/common/utils/password";
import { PrismaClient } from "@/generated/prisma";
import type { AuthResponse, LoginBody, RegisterBody } from "./auth.schema";

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

      return this.buildAuthResponse(user);
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

    return this.buildAuthResponse(user);
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

    return this.buildAuthResponse(user);
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    name: string;
    role: string;
  }): Promise<AuthResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      generateAccessToken(user),
      generateRefreshToken(user.id),
    ]);

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken,
    };
  }
}
