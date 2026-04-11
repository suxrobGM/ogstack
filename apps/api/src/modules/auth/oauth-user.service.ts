import { singleton } from "tsyringe";
import { UnauthorizedError } from "@/common/errors";
import { generatePublicId } from "@/common/utils/crypto";
import { generateAccessToken, generateRefreshToken } from "@/common/utils/jwt";
import { PrismaClient } from "@/generated/prisma";
import type { AuthResponse } from "./auth.schema";

export interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
}

@singleton()
export class OAuthUserService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Find an existing user by OAuth provider ID or email, or create a new one.
   * Links the OAuth provider ID if the user already exists with the same email.
   */
  async findOrCreateUser(
    provider: "github" | "google",
    profile: OAuthProfile,
  ): Promise<AuthResponse> {
    const providerIdField = provider === "github" ? "githubId" : "googleId";

    const existingByProvider = await this.prisma.user.findUnique({
      where: { [providerIdField]: profile.id } as any,
    });

    if (existingByProvider) {
      if (existingByProvider.deletedAt) {
        throw new UnauthorizedError("This account has been deactivated");
      }
      if (profile.avatarUrl && profile.avatarUrl !== existingByProvider.avatarUrl) {
        await this.prisma.user.update({
          where: { id: existingByProvider.id },
          data: { avatarUrl: profile.avatarUrl },
        });
      }
      return this.buildAuthResponse(existingByProvider);
    }

    const existingByEmail = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });

    if (existingByEmail) {
      if (existingByEmail.deletedAt) {
        throw new UnauthorizedError("This account has been deactivated");
      }
      const updated = await this.prisma.user.update({
        where: { id: existingByEmail.id },
        data: {
          [providerIdField]: profile.id,
          emailVerified: true,
          avatarUrl: existingByEmail.avatarUrl ?? profile.avatarUrl,
        },
      });
      return this.buildAuthResponse(updated);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          [providerIdField]: profile.id,
          avatarUrl: profile.avatarUrl,
          emailVerified: true,
        },
      });

      await tx.project.create({
        data: {
          userId: user.id,
          publicId: generatePublicId(),
          name: "Default Project",
        },
      });

      return user;
    });

    return this.buildAuthResponse(result);
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
