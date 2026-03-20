import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import pino from 'pino';
import { generateRoutes } from './routes/generate.js';
import { cacheRoutes } from './routes/cache.js';
import { usageRoutes } from './routes/usage.js';
import { auditRoutes } from './routes/audit.js';

const logger = pino({ level: process.env['LOG_LEVEL'] ?? 'info' });

const app = Fastify({ logger });

await app.register(rateLimit, {
  global: true,
  max: 100,
  timeWindow: '1 minute',
});

// Register route plugins
await app.register(generateRoutes);
await app.register(cacheRoutes);
await app.register(usageRoutes);
await app.register(auditRoutes);

// Health check
app.get('/health', async () => ({ status: 'ok', ts: new Date().toISOString() }));

const port = parseInt(process.env['API_PORT'] ?? '3001', 10);
const host = process.env['API_HOST'] ?? '0.0.0.0';

await app.listen({ port, host });
logger.info({ port, host }, 'OGStack API server started');
