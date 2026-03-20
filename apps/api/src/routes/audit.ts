import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { crawlSite, validateOGTags, enqueueUrls } from '@ogstack/audit';
import { validateUrl, PrismaClient } from '@ogstack/shared';

const prisma = new PrismaClient();

const AuditRequestSchema = z.object({
  url: z.string().url(),
  maxUrls: z.number().int().min(1).max(200).optional().default(50),
});

export async function auditRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: unknown }>(
    '/v1/audit',
    async (request, reply) => {
      const parsed = AuditRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message, code: 'INVALID_INPUT' });
      }

      const { url, maxUrls } = parsed.data;
      const validation = validateUrl(url);
      if (!validation.valid) {
        return reply.code(400).send({ error: validation.reason, code: 'INVALID_URL' });
      }

      // For small crawls (≤5 URLs), run synchronously
      if (maxUrls <= 5) {
        const crawl = await crawlSite(url, maxUrls);
        const results = await Promise.all(
          crawl.urls.map((u) => validateOGTags(u).catch((err: unknown) => ({ url: u, error: String(err) }))),
        );
        return reply.send({ url, results });
      }

      // For larger crawls, queue and return job ID
      const audit = await prisma.audit.create({
        data: { workspaceId: 'public', siteUrl: url, status: 'RUNNING' },
      });

      const crawl = await crawlSite(url, maxUrls);
      await enqueueUrls(audit.id, crawl.urls);

      await prisma.audit.update({
        where: { id: audit.id },
        data: { urlsFound: crawl.urls.length },
      });

      return reply.code(202).send({
        auditId: audit.id,
        status: 'RUNNING',
        urlsQueued: crawl.urls.length,
      });
    },
  );
}
