import { Redis } from 'ioredis';

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env['REDIS_URL'];
    if (!url) throw new Error('REDIS_URL environment variable is not set');
    _redis = new Redis(url, { lazyConnect: true });
  }
  return _redis;
}

export async function getCached(key: string): Promise<string | null> {
  const redis = getRedis();
  return redis.get(key);
}

export async function setCached(
  key: string,
  value: string,
  ttlSeconds = 86_400,
): Promise<void> {
  const redis = getRedis();
  await redis.set(key, value, 'EX', ttlSeconds);
}

export async function deleteCached(key: string): Promise<void> {
  const redis = getRedis();
  await redis.del(key);
}

export function buildCacheKey(url: string): string {
  // Normalize URL to a stable cache key
  const normalized = new URL(url);
  return `og:${normalized.hostname}${normalized.pathname}${normalized.search}`;
}
