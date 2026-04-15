import { isPlanAtLeast, isValidDomain, Plan, PLAN_CONFIGS, UNLIMITED } from "@ogstack/shared";
import { singleton } from "tsyringe";
import { BadRequestError, NotFoundError, PlanLimitError } from "@/common/errors";
import { generatePublicId } from "@/common/utils/crypto";
import { PrismaClient } from "@/generated/prisma";
import type { PaginatedResponse } from "@/types/response";
import type {
  CreateProjectBody,
  Project,
  ProjectListQuery,
  UpdateProjectBody,
} from "./project.schema";

function validateDomains(domains: string[]): string[] {
  const normalized = domains.map((d) => d.trim().toLowerCase()).filter(Boolean);
  for (const domain of normalized) {
    if (!isValidDomain(domain)) {
      throw new BadRequestError(
        `Invalid domain "${domain}". Use bare hostnames like example.com or sub.example.com.`,
      );
    }
  }
  return Array.from(new Set(normalized));
}

@singleton()
export class ProjectService {
  constructor(private readonly prisma: PrismaClient) {}

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

  async getById(userId: string, projectId: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }
    return this.toResponse(project);
  }

  async create(userId: string, data: CreateProjectBody): Promise<Project> {
    const plan = await this.getUserPlan(userId);
    const config = PLAN_CONFIGS[plan];

    if (config.projectLimit !== UNLIMITED) {
      const count = await this.prisma.project.count({ where: { userId } });
      if (count >= config.projectLimit) {
        throw new PlanLimitError(
          `Your plan allows up to ${config.projectLimit} project${config.projectLimit === 1 ? "" : "s"}. Upgrade for more.`,
        );
      }
    }

    const domains = validateDomains(data.domains);
    this.enforceDomainLimit(plan, domains);

    const project = await this.prisma.project.create({
      data: {
        userId,
        publicId: generatePublicId(),
        name: data.name,
        domains,
      },
    });

    return this.toResponse(project);
  }

  async update(userId: string, projectId: string, data: UpdateProjectBody): Promise<Project> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }

    const patch: { name?: string; domains?: string[] } = {};
    if (data.name !== undefined) patch.name = data.name;
    if (data.domains !== undefined) {
      const domains = validateDomains(data.domains);
      const plan = await this.getUserPlan(userId);
      this.enforceDomainLimit(plan, domains);
      patch.domains = domains;
    }

    const updated = await this.prisma.project.update({ where: { id: projectId }, data: patch });
    return this.toResponse(updated);
  }

  async delete(userId: string, projectId: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new NotFoundError("Project not found");
    }
    await this.prisma.project.delete({ where: { id: projectId } });
  }

  private enforceDomainLimit(plan: Plan, domains: string[]): void {
    const config = PLAN_CONFIGS[plan];
    if (config.domainsPerProject === UNLIMITED) return;
    if (domains.length > config.domainsPerProject) {
      const upgradeHint = isPlanAtLeast(plan, Plan.PRO)
        ? ""
        : " Upgrade for more domains per project.";
      throw new PlanLimitError(
        `Your plan allows up to ${config.domainsPerProject} domain${config.domainsPerProject === 1 ? "" : "s"} per project.${upgradeHint}`,
      );
    }
  }

  private async getUserPlan(userId: string): Promise<Plan> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    return user?.plan ?? Plan.FREE;
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
