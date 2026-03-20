import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { deleteCached, buildCacheKey } from '@ogstack/cache';
import { validateUrl } from '@ogstack/shared';
import { requireAuth } from '../middleware/auth.js';

const DeleteCacheQuerySchema = z.object({
  url: z.string().url(),
});

export async function cacheRoutes(app: FastifyInstance): Promise<void> {
  app.delete<{ Querystring: { url: string } }>(
    '/v1/cache',
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsed = DeleteCacheQuerySchema.safeParse(request.query);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message, code: 'INVALID_INPUT' });
      }

      const { url } = parsed.data;
      const validation = validateUrl(url);
      if (!validation.valid) {
        return reply.code(400).send({ error: validation.reason, code: 'INVALID_URL' });
      }

      const cacheKey = buildCacheKey(url);
      await deleteCached(cacheKey);

      return reply.send({ success: true, url });
    },
  );
}
