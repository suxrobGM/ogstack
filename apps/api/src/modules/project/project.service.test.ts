import { beforeEach, describe, expect, it, mock } from "bun:test";
import { container } from "@/common/di";
import { PrismaClient } from "@/generated/prisma";
import { ProjectService } from "./project.service";

function createMockProject(overrides = {}) {
  return {
    id: "proj-uuid-1",
    userId: "user-uuid-1",
    publicId: "abc12345",
    name: "Test Project",
    domains: ["example.com"],
    isActive: true,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  };
}

function createMockPrisma() {
  return {
    project: {
      findMany: mock(() => Promise.resolve([createMockProject()])),
      findUnique: mock(() => Promise.resolve(createMockProject())),
      count: mock(() => Promise.resolve(1)),
      create: mock(() => Promise.resolve(createMockProject())),
      update: mock(() => Promise.resolve(createMockProject({ name: "Updated" }))),
      delete: mock(() => Promise.resolve(createMockProject())),
    },
  } as unknown as PrismaClient;
}

describe("ProjectService", () => {
  let service: ProjectService;
  let mockPrisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrisma();
    container.registerInstance(PrismaClient, mockPrisma as unknown as PrismaClient);
    service = container.resolve(ProjectService);
  });

  describe("list", () => {
    it("should return paginated projects for a user", async () => {
      const result = await service.list("user-uuid-1", { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.items[0]!.name).toBe("Test Project");
      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it("should pass search filter to prisma query", async () => {
      await service.list("user-uuid-1", { page: 1, limit: 20, search: "test" });

      const findManyCall = (mockPrisma.project.findMany as ReturnType<typeof mock>).mock.calls[0];
      const where = (findManyCall as unknown[])[0] as { where: Record<string, unknown> };
      expect(where.where).toHaveProperty("name");
    });

    it("should calculate correct skip offset", async () => {
      await service.list("user-uuid-1", { page: 3, limit: 10 });

      const findManyCall = (mockPrisma.project.findMany as ReturnType<typeof mock>).mock.calls[0];
      const args = (findManyCall as unknown[])[0] as { skip: number };
      expect(args.skip).toBe(20);
    });
  });

  describe("getById", () => {
    it("should return project when user is owner", async () => {
      const result = await service.getById("user-uuid-1", "proj-uuid-1");

      expect(result.id).toBe("proj-uuid-1");
      expect(result.name).toBe("Test Project");
    });

    it("should throw NotFoundError when project does not exist", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.getById("user-uuid-1", "nonexistent")).rejects.toThrow("Project not found");
    });

    it("should throw NotFoundError when user is not the owner", async () => {
      expect(service.getById("other-user", "proj-uuid-1")).rejects.toThrow("Project not found");
    });
  });

  describe("create", () => {
    it("should create a project with generated publicId", async () => {
      const result = await service.create("user-uuid-1", {
        name: "New Project",
        domains: ["newdomain.com"],
      });

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("publicId");
      expect(mockPrisma.project.create).toHaveBeenCalled();
    });

    it("should default domains to empty array", async () => {
      await service.create("user-uuid-1", { name: "No Domains" });

      const createCall = (mockPrisma.project.create as ReturnType<typeof mock>).mock.calls[0];
      const data = (createCall as unknown[])[0] as { data: { domains: string[] } };
      expect(data.data.domains).toEqual([]);
    });
  });

  describe("update", () => {
    it("should update project when user is owner", async () => {
      const result = await service.update("user-uuid-1", "proj-uuid-1", { name: "Updated" });

      expect(result).toHaveProperty("id");
      expect(mockPrisma.project.update).toHaveBeenCalled();
    });

    it("should throw NotFoundError when project does not exist", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.update("user-uuid-1", "nonexistent", { name: "X" })).rejects.toThrow(
        "Project not found",
      );
    });

    it("should throw NotFoundError when user is not the owner", async () => {
      expect(service.update("other-user", "proj-uuid-1", { name: "X" })).rejects.toThrow(
        "Project not found",
      );
    });
  });

  describe("delete", () => {
    it("should delete project when user is owner", async () => {
      await service.delete("user-uuid-1", "proj-uuid-1");

      expect(mockPrisma.project.delete).toHaveBeenCalled();
    });

    it("should throw NotFoundError when project does not exist", async () => {
      (mockPrisma.project.findUnique as ReturnType<typeof mock>).mockResolvedValue(null);

      expect(service.delete("user-uuid-1", "nonexistent")).rejects.toThrow("Project not found");
    });

    it("should throw NotFoundError when user is not the owner", async () => {
      expect(service.delete("other-user", "proj-uuid-1")).rejects.toThrow("Project not found");
    });
  });
});
