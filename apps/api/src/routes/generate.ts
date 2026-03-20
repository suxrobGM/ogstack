import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { scrapePage } from '@ogstack/scraper';
import { buildGenerationPrompt, generateImageWithFlux } from '@ogstack/ai-pipeline';
import { renderOGImage } from '@ogstack/compositor';
import { getCached, setCached, buildCacheKey, uploadImage, buildImageKey } from '@ogstack/cache';
import { resolveBrand, getDefaultBrand } from '@ogstack/brand';
import { validateUrl, GenerationRequestSchema } from '@ogstack/shared';
import { requireAuth } from '../middleware/auth.js';
import type { GenerationResult } from '@ogstack/shared';

const PublicGenerateQuerySchema = z.object({
  url: z.string().url(),
});

export async function generateRoutes(app: FastifyInstance): Promise<void> {
  // Public endpoint — meta tag integration
  app.get<{ Params: { projectId: string }; Querystring: { url: string } }>(
    '/p/:projectId/generate',
    {
      schema: {
        querystring: PublicGenerateQuerySchema,
      },
    },
    async (request, reply) => {
      const { url } = request.query;
      const { projectId } = request.params;

      const validation = validateUrl(url);
      if (!validation.valid) {
        return reply.code(400).send({ error: validation.reason, code: 'INVALID_URL' });
      }

      const cacheKey = buildCacheKey(url);
      const cached = await getCached(cacheKey);
      if (cached) {
        return reply
          .header('X-Cache', 'HIT')
          .header('Content-Type', 'image/png')
          .redirect(cached);
      }

      const [pageCtx, brand] = await Promise.all([
        scrapePage(url),
        resolveBrand(projectId).catch(() => getDefaultBrand()),
      ]);

      const prompt = await buildGenerationPrompt(pageCtx, brand);
      const { imageUrl: aiImageUrl } = await generateImageWithFlux(prompt.imagePrompt);
      const pngBuffer = await renderOGImage(prompt, brand, aiImageUrl);

      const imageKey = buildImageKey(projectId, url);
      const storedUrl = await uploadImage(imageKey, pngBuffer);

      await setCached(cacheKey, storedUrl);

      return reply
        .header('X-Cache', 'MISS')
        .header('Content-Type', 'image/png')
        .redirect(storedUrl);
    },
  );

  // Authenticated endpoint — programmatic
  app.post<{ Body: unknown }>(
    '/v1/generate',
    { preHandler: requireAuth },
    async (request, reply) => {
      const parsed = GenerationRequestSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({ error: parsed.error.message, code: 'INVALID_INPUT' });
      }

      const { url, forceRegenerate } = parsed.data;
      const workspaceId = request.workspaceId ?? 'unknown';
      const start = Date.now();

      const cacheKey = buildCacheKey(url);

      if (!forceRegenerate) {
        const cached = await getCached(cacheKey);
        if (cached) {
          const result: GenerationResult = {
            imageUrl: cached,
            cached: true,
            durationMs: Date.now() - start,
            generationId: 'cached',
          };
          return reply.send(result);
        }
      }

      const [pageCtx, brand] = await Promise.all([
        scrapePage(url),
        resolveBrand(workspaceId),
      ]);

      const prompt = await buildGenerationPrompt(pageCtx, brand);
      const { imageUrl: aiImageUrl } = await generateImageWithFlux(prompt.imagePrompt);
      const pngBuffer = await renderOGImage(prompt, brand, aiImageUrl);

      const imageKey = buildImageKey(workspaceId, url);
      const storedUrl = await uploadImage(imageKey, pngBuffer);
      await setCached(cacheKey, storedUrl);

      const result: GenerationResult = {
        imageUrl: storedUrl,
        cached: false,
        durationMs: Date.now() - start,
        generationId: imageKey,
      };

      return reply.code(201).send(result);
    },
  );
}
