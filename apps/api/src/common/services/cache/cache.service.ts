import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import type { ICacheService } from "./types";

/** Maximum number of cache entries before forced eviction */
const MAX_CACHE_SIZE = 10_000;

/** Interval for automatic cleanup of expired entries (5 minutes) */
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Cache entry with value and expiration
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-Memory Cache Service
 * Simple Map-based cache with TTL support and automatic cleanup.
 * Can be replaced with Redis implementation later.
 */
@singleton()
export class CacheService implements ICacheService {
  private readonly cache = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanup();
  }

  /**
   * Get value from cache
   * Returns null if key doesn't exist or is expired
   */
  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.value as T;
  }

  /**
   * Set value in cache with TTL
   * @param key Cache key
   * @param value Value to cache
   * @param ttlMs Time to live in milliseconds
   */
  async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });

    if (this.cache.size > MAX_CACHE_SIZE) {
      this.evict();
    }
  }

  /**
   * Delete key from cache
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * Get cache size (for debugging)
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    let removed = 0;
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        removed++;
      }
    }
    if (removed > 0) {
      logger.debug(
        `Cache cleanup: removed ${removed} expired entries, ${this.cache.size} remaining`,
      );
    }
  }

  /**
   * Stop the automatic cleanup timer.
   * Call on application shutdown to prevent the interval from keeping the process alive.
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  private startCleanup(): void {
    if (this.cleanupInterval) return;
    this.cleanupInterval = setInterval(() => this.cleanup(), CLEANUP_INTERVAL);
  }

  /**
   * Evict entries when cache exceeds MAX_CACHE_SIZE.
   * Removes expired entries first, then oldest by insertion order.
   */
  private evict(): void {
    this.cleanup();

    while (this.cache.size > MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey == null) {
        break;
      }
      this.cache.delete(oldestKey);
    }
  }
}
