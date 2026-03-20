import type { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@ogstack/shared';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

declare module 'fastify' {
  interface FastifyRequest {
    workspaceId?: string;
  }
}

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers['authorization'];
  if (!authHeader?.startsWith('Bearer ')) {
    await reply.code(401).send({ error: 'Missing or invalid Authorization header', code: 'UNAUTHORIZED' });
    return;
  }

  const rawKey = authHeader.slice(7);
  if (!rawKey) {
    await reply.code(401).send({ error: 'Empty API key', code: 'UNAUTHORIZED' });
    return;
  }

  // Find key by prefix (first 8 chars)
  const prefix = rawKey.slice(0, 8);
  const apiKey = await prisma.apiKey.findFirst({
    where: { keyPrefix: prefix },
  });

  if (!apiKey) {
    await reply.code(401).send({ error: 'Invalid API key', code: 'UNAUTHORIZED' });
    return;
  }

  // Verify bcrypt hash
  const valid = await bcrypt.compare(rawKey, apiKey.keyHash);
  if (!valid) {
    await reply.code(401).send({ error: 'Invalid API key', code: 'UNAUTHORIZED' });
    return;
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  request.workspaceId = apiKey.workspaceId;
}
