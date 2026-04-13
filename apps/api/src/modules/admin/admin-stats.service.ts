import { singleton } from "tsyringe";
import { PrismaClient } from "@/generated/prisma";
import type { AdminStatsResponse } from "./admin.schema";

@singleton()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getStats(): Promise<AdminStatsResponse> {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, suspendedUsers, signupsThisWeek, imagesToday, imagesThisMonth, byPlan] =
      await Promise.all([
        this.prisma.user.count({ where: { deletedAt: null } }),
        this.prisma.user.count({ where: { deletedAt: null, suspended: true } }),
        this.prisma.user.count({ where: { deletedAt: null, createdAt: { gte: weekAgo } } }),
        this.prisma.image.count({ where: { createdAt: { gte: todayStart } } }),
        this.prisma.image.count({ where: { createdAt: { gte: monthStart } } }),
        this.prisma.user.groupBy({
          by: ["plan"],
          where: { deletedAt: null },
          _count: { _all: true },
        }),
      ]);

    const planDistribution = { FREE: 0, PRO: 0, BUSINESS: 0, ENTERPRISE: 0 };
    for (const row of byPlan) {
      const key = row.plan as keyof typeof planDistribution;
      if (key in planDistribution) planDistribution[key] = row._count._all;
    }

    return {
      totalUsers,
      suspendedUsers,
      signupsThisWeek,
      imagesToday,
      imagesThisMonth,
      planDistribution,
    };
  }
}
