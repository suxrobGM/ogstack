import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { PrismaClient } from '@ogstack/shared';
import { requireAuth } from '../middleware/auth.js';

const prisma = new PrismaClient();

const UsageQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).default('month'),
});

export async function usageRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: { period?: string } }>(
    '/v1/usage',
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsed = UsageQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message, code: 'INVALID_INPUT' });
      }

      const { period } = parsed.data;
      const workspaceId = request.workspaceId ?? 'unknown';

      const since = new Date();
      if (period === 'day') since.setDate(since.getDate() - 1);
      else if (period === 'week') since.setDate(since.getDate() - 7);
      else since.setMonth(since.getMonth() - 1);

      const [total, successful, failed] = await Promise.all([
        prisma.generation.count({ where: { workspaceId, createdAt: { gte: since } } }),
        prisma.generation.count({
          where: { workspaceId, createdAt: { gte: since }, status: 'COMPLETE' },
        }),
        prisma.generation.count({
          where: { workspaceId, createdAt: { gte: since }, status: 'FAILED' },
        }),
      ]);

      return reply.send({ period, since, total, successful, failed });
    },
  );
}
