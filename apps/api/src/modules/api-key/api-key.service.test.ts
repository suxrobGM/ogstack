import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { ApiKeyService } from "./api-key.service";

function createMockApiKey(overrides = {}) {
  return {
    id: "key-uuid-1",
    projectId: "proj-uuid-1",
    userId: "user-uuid-1",
    keyHash: "hashed_key",
    prefix: "og_live_a1b2c3d4...",
    name: "Production Key",
    lastUsedAt: null,
    revokedAt: null,
    createdAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createMockProject(overrides = {}) {
  return {
    id: "proj-uuid-1",
    userId: "user-uuid-1",
    publicId: "abc12345",
    name: "Test Project",
    domains: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    project: {
      findUnique: mock(() => Promise.resolve(createMockProject())),
    },
    apiKey: {
      create: mock(() => Promise.resolve(createMockApiKey())),
      findMany: mock(() => Promise.resolve([createMockApiKey()])),
      findUnique: mock(() => Promise.resolve(createMockApiKey())),
      update: mock(() => Promise.resolve(createMockApiKey())),
      delete: mock(() => Promise.resolve(createMockApiKey())),
    },
  } as unknown as PrismaClient;
}

describe("ApiKeyService", () => {
  let service: ApiKeyService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    service = container.resolve(ApiKeyService);
  });

  describe("create", () => {
    it("should create an API key and return the raw key", async () => {
      const result = await service.create("user-uuid-1", "proj-uuid-1", {
        name: "Production Key",
      });

      expect(result).toHaveProperty("key");
      expect(result.key).toStartWith("og_live_");
      expect(result).toHaveProperty("prefix");
      expect(result).toHaveProperty("id");
      expect(mockPrisma.apiKey.create).toHaveBeenCalled();
    });

    it("should store a hash, not the raw key", async () => {
      await service.create("user-uuid-1", "proj-uuid-1", { name: "Test" });

      const createCall = (mockPrisma.apiKey.create as ReturnType<typeof mock>).mock.calls[0];
      const data = (createCall as unknown[])[0] as { data: { keyHash: string } };
      expect(data.data.keyHash).not.toStartWith("og_live_");
    });

    it("should throw NotFoundError if project does not belong to user", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockProject({ userId: "other-user" }),
      );

      expect(service.create("user-uuid-1", "proj-uuid-1", { name: "Test" })).rejects.toThrow(
        "Project not found",
      );
    });

    it("should throw NotFoundError if project does not exist", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.create("user-uuid-1", "nonexistent", { name: "Test" })).rejects.toThrow(
        "Project not found",
      );
    });
  });

  describe("list", () => {
    it("should return keys with prefix only", async () => {
      const result = await service.list("user-uuid-1", "proj-uuid-1");

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty("prefix");
      expect(result[0]).not.toHaveProperty("keyHash");
      expect(result[0]).not.toHaveProperty("key");
    });

    it("should throw NotFoundError if project does not belong to user", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockProject({ userId: "other-user" }),
      );

      expect(service.list("user-uuid-1", "proj-uuid-1")).rejects.toThrow("Project not found");
    });
  });

  describe("delete", () => {
    it("should delete an API key owned by the user", async () => {
      await service.delete("user-uuid-1", "key-uuid-1");

      expect(mockPrisma.apiKey.delete).toHaveBeenCalled();
    });

    it("should throw NotFoundError if key does not exist", async () => {
      (mockPrisma.apiKey.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.delete("user-uuid-1", "nonexistent")).rejects.toThrow("API key not found");
    });

    it("should throw NotFoundError if user does not own the key", async () => {
      expect(service.delete("other-user", "key-uuid-1")).rejects.toThrow("API key not found");
    });
  });

  describe("validate", () => {
    it("should return userId and projectId for a valid key", async () => {
      // Mock findUnique to match by keyHash
      (mockPrisma.apiKey.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockApiKey(),
      );

      const result = await service.validate("og_live_somekey");

      expect(result).toEqual({
        userId: "user-uuid-1",
        projectId: "proj-uuid-1",
      });
    });

    it("should update lastUsedAt on successful validation", async () => {
      (mockPrisma.apiKey.findUnique as ReturnType<typeof mock>).mockResolvedValue(
        createMockApiKey(),
      );

      await service.validate("og_live_somekey");

      expect(mockPrisma.apiKey.update).toHaveBeenCalled();
    });

    it("should return null for an unknown key", async () => {
      (mockPrisma.apiKey.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      const result = await service.validate("og_live_unknownkey");

      expect(result).toBeNull();
    });
  });
});
