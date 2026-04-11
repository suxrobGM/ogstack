import { singleton } from "tsyringe";
import { BadRequestError, NotFoundError } from "@/common/errors";
import { Plan, PrismaClient, type UserRole } from "@/generated/prisma";
import type { PaginatedResponse } from "@/types/response";
import type {
  AdminUser,
  AdminUserDetail,
  AdminUserListQuery,
  AdminUserPlanResponse,
  AdminUserSuspendResponse,
  SuspendUserBody,
  UpdateUserPlanBody,
} from "./admin.schema";

@singleton()
export class AdminService {
  constructor(private readonly prisma: PrismaClient) {}

  async listUsers(query: AdminUserListQuery): Promise<PaginatedResponse<AdminUser>> {
    const { page, limit, search, plan, status } = query;
    const skip = (page - 1) * limit;

    const where = {
      deletedAt: null,
      ...(search && {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { name: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(plan && { plan }),
      ...(status === "suspended" && { suspended: true }),
      ...(status === "active" && { suspended: false }),
    };

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      items: items.map(this.toAdminUser),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserDetail(userId: string): Promise<AdminUserDetail> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        projects: {
          orderBy: { createdAt: "desc" },
          select: { id: true, name: true, publicId: true, isActive: true, createdAt: true },
        },
        apiKeys: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            prefix: true,
            name: true,
            projectId: true,
            lastUsedAt: true,
            revokedAt: true,
            createdAt: true,
          },
        },
        usageRecords: {
          orderBy: { period: "desc" },
          take: 12,
          select: { period: true, imageCount: true, aiImageCount: true, cacheHits: true },
        },
      },
    });

    if (!user) throw new NotFoundError("User not found");

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
      avatarUrl: user.avatarUrl,
      emailVerified: user.emailVerified,
      suspended: user.suspended,
      deletedAt: user.deletedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      projects: user.projects,
      apiKeys: user.apiKeys,
      usage: user.usageRecords,
    };
  }

  async updateUserPlan(
    targetUserId: string,
    body: UpdateUserPlanBody,
    actorId: string,
    actorRole: UserRole,
  ): Promise<AdminUserPlanResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundError("User not found");

    const oldPlan = user.plan;
    if (oldPlan === body.plan) {
      throw new BadRequestError(`User is already on the ${body.plan} plan`);
    }

    const pricingPlan = await this.prisma.pricingPlan.findUnique({
      where: { key: body.plan },
    });
    if (!pricingPlan) throw new NotFoundError(`Plan ${body.plan} not found`);

    const now = new Date();
    const oneYearFromNow = new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);

    const [updated] = await Promise.all([
      this.prisma.user.update({
        where: { id: targetUserId },
        data: { plan: body.plan as Plan },
      }),
      this.prisma.subscription.upsert({
        where: { userId: targetUserId },
        create: {
          userId: targetUserId,
          planId: pricingPlan.id,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: oneYearFromNow,
          isComp: true,
        },
        update: {
          planId: pricingPlan.id,
          status: "active",
          currentPeriodStart: now,
          currentPeriodEnd: oneYearFromNow,
          isComp: true,
          cancelAtPeriodEnd: false,
          cancelAt: null,
        },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId,
          actorRole,
          action: "UPDATE_USER_PLAN",
          entityType: "User",
          entityId: targetUserId,
          metadata: { oldPlan, newPlan: body.plan, isComp: true },
        },
      }),
    ]);

    return { id: updated.id, plan: updated.plan, updatedAt: updated.updatedAt };
  }

  async suspendUser(
    targetUserId: string,
    body: SuspendUserBody,
    actorId: string,
    actorRole: UserRole,
  ): Promise<AdminUserSuspendResponse> {
    const user = await this.prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) throw new NotFoundError("User not found");

    if (body.suspend && user.suspended) {
      throw new BadRequestError("User is already suspended");
    }
    if (!body.suspend && !user.suspended) {
      throw new BadRequestError("User is not suspended");
    }

    const [updated] = await Promise.all([
      this.prisma.user.update({
        where: { id: targetUserId },
        data: { suspended: body.suspend },
      }),
      this.prisma.auditLog.create({
        data: {
          actorId,
          actorRole,
          action: body.suspend ? "SUSPEND_USER" : "UNSUSPEND_USER",
          entityType: "User",
          entityId: targetUserId,
          metadata: { suspend: body.suspend },
        },
      }),
    ]);

    return { id: updated.id, suspended: updated.suspended, updatedAt: updated.updatedAt };
  }

  private toAdminUser(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    plan: string;
    emailVerified: boolean;
    suspended: boolean;
    createdAt: Date;
  }): AdminUser {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
      emailVerified: user.emailVerified,
      suspended: user.suspended,
      createdAt: user.createdAt,
    };
  }
}
