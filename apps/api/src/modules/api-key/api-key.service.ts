import { singleton } from "tsyringe";
import { NotFoundError } from "@/common/errors";
import { generateApiKey, hashSha256 } from "@/common/utils/crypto";
import { PrismaClient } from "@/generated/prisma";
import type { ApiKey, ApiKeyWithSecret, CreateApiKeyBody } from "./api-key.schema";

@singleton()
export class ApiKeyService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Create a new API key. Returns the raw key once — it is never stored.
   */
  async create(userId: string, data: CreateApiKeyBody): Promise<ApiKeyWithSecret> {
    const projectId = data.projectId ?? null;
    if (projectId) {
      await this.assertProjectOwner(userId, projectId);
    }

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
      include: { project: { select: { id: true, name: true } } },
    });

    return {
      id: apiKey.id,
      key: raw,
      prefix: apiKey.prefix,
      name: apiKey.name,
      project: apiKey.project ? { id: apiKey.project.id, name: apiKey.project.name } : null,
      createdAt: apiKey.createdAt,
    };
  }

  /** List API keys for the user, optionally scoped to a project. */
  async list(userId: string, projectId?: string): Promise<ApiKey[]> {
    if (projectId) {
      await this.assertProjectOwner(userId, projectId);
    }

    const keys = await this.prisma.apiKey.findMany({
      where: {
        userId,
        ...(projectId && { projectId }),
      },
      include: { project: { select: { id: true, name: true } } },
      orderBy: { createdAt: "desc" },
    });

    return keys.map((k) => ({
      id: k.id,
      prefix: k.prefix,
      name: k.name,
      project: k.project ? { id: k.project.id, name: k.project.name } : null,
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

  /** Validate a raw API key. `projectId` is null when the key applies to all projects. */
  async validate(
    rawKey: string,
  ): Promise<{ userId: string; projectId: string | null; plan: string } | null> {
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
