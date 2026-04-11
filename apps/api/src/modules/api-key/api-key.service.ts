import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors";
import { generateApiKey, hashSha256 } from "@/common/utils/crypto";
import { PrismaClient } from "@/generated/prisma";
import type { ApiKey, ApiKeyCreated, CreateApiKeyBody } from "./api-key.schema";

@singleton()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaClient) {}

  /** Create a new API key. Returns the raw key once — it is never stored. */
  async create(userId: string, projectId: string, data: CreateApiKeyBody): Promise<ApiKeyCreated> {
    await this.assertProjectOwner(userId, projectId);

    const { raw, prefix } = generateApiKey();
    const keyHash = await hashSha256(raw);

    const apiKey = await this.prisma.apiKey.create({
      data: {
        userId,
        projectId,
        keyHash,
        prefix,
        name: data.name,
      },
    });

    return {
      id: apiKey.id,
      key: raw,
      prefix: apiKey.prefix,
      name: apiKey.name,
      createdAt: apiKey.createdAt,
    };
  }

  /** List all API keys for a project (prefix only, no raw key). */
  async list(userId: string, projectId: string): Promise<ApiKey[]> {
    await this.assertProjectOwner(userId, projectId);

    const keys = await this.prisma.apiKey.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });

    return keys.map((k) => ({
      id: k.id,
      prefix: k.prefix,
      name: k.name,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
    }));
  }

  /** Delete an API key. Owner only. */
  async delete(userId: string, apiKeyId: string): Promise<void> {
    const apiKey = await this.prisma.apiKey.findUnique({
      where: { id: apiKeyId },
    });

    if (!apiKey || apiKey.userId !== userId) {
      throw new NotFoundError("API key not found");
    }

    await this.prisma.apiKey.delete({ where: { id: apiKeyId } });
  }

  /** Validate a raw API key. Returns the key record with project and user plan info, or null. */
  async validate(
    rawKey: string,
  ): Promise<{ userId: string; projectId: string; plan: string } | null> {
    const keyHash = await hashSha256(rawKey);

    const apiKey = await this.prisma.apiKey.findUnique({
      where: { keyHash },
      include: { user: { select: { plan: true } } },
    });

    if (!apiKey) return null;

    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsedAt: new Date() },
    });

    return { userId: apiKey.userId, projectId: apiKey.projectId, plan: apiKey.user.plan };
  }

  private async assertProjectOwner(userId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }
  }
}
