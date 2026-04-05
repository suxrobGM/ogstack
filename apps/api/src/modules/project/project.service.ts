import { injectable } from "tsyringe";
import { NotFoundError } from "@/common/errors";
import { generatePublicId } from "@/common/utils/crypto";
import { PrismaClient } from "@/generated/prisma";
import type { PaginatedResponse } from "@/types/response";
import type {
  CreateProjectBody,
  Project,
  ProjectListQuery,
  UpdateProjectBody,
} from "./project.schema";

@injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaClient) {}

  /** List projects owned by the authenticated user, with pagination and optional search. */
  async list(userId: string, query: ProjectListQuery): Promise<PaginatedResponse<Project>> {
    const { page, limit, search } = query;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(search && { name: { contains: search, mode: "insensitive" as const } }),
    };

    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      items: items.map(this.toResponse),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** Get a single project by ID, ensuring it belongs to the authenticated user. */
  async getById(userId: string, projectId: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    return this.toResponse(project);
  }

  /** Create a new project with an auto-generated publicId. */
  async create(userId: string, data: CreateProjectBody): Promise<Project> {
    const project = await this.prisma.project.create({
      data: {
        userId,
        publicId: generatePublicId(),
        name: data.name,
        domains: data.domains ?? [],
      },
    });

    return this.toResponse(project);
  }

  /** Update a project's name and/or domains. Owner only. */
  async update(userId: string, projectId: string, data: UpdateProjectBody): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    const updated = await this.prisma.project.update({
      where: { id: projectId },
      data,
    });

    return this.toResponse(updated);
  }

  /** Delete a project. Owner only. */
  async delete(userId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    await this.prisma.project.delete({ where: { id: projectId } });
  }

  private toResponse(project: {
    id: string;
    publicId: string;
    name: string;
    domains: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): Project {
    return {
      id: project.id,
      publicId: project.publicId,
      name: project.name,
      domains: project.domains,
      isActive: project.isActive,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    };
  }
}
