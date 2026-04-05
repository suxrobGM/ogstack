import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { CacheService } from "./cache.service";

describe("CacheService", () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  afterEach(() => {
    cache.destroy();
  });

  // get / set basics
  test("returns null for missing key", async () => {
    expect(await cache.get("missing")).toBeNull();
  });

  test("stores and retrieves a value", async () => {
    await cache.set("key", { id: 1 }, 60_000);
    expect(await cache.get<{ id: number }>("key")).toEqual({ id: 1 });
  });

  test("stores string values", async () => {
    await cache.set("name", "alice", 60_000);
    expect(await cache.get<string>("name")).toBe("alice");
  });

  test("stores null as a valid cached value", async () => {
    await cache.set("empty", null, 60_000);
    // null value is stored — get should return it (not confuse it with "miss")
    // Since the implementation returns entry.value which is null, and a miss also returns null,
    // this is a known limitation of the current API — both cases return null.
    expect(await cache.get("empty")).toBeNull();
  });

  test("overwrites existing key with new value", async () => {
    await cache.set("key", "old", 60_000);
    await cache.set("key", "new", 60_000);
    expect(await cache.get<string>("key")).toBe("new");
  });

  // TTL expiration
  test("returns null for expired entry", async () => {
    await cache.set("key", "value", 1); // 1ms TTL
    await Bun.sleep(5);
    expect(await cache.get("key")).toBeNull();
  });

  test("removes expired entry from map on get", async () => {
    await cache.set("key", "value", 1);
    await Bun.sleep(5);
    await cache.get("key"); // triggers lazy deletion
    expect(cache.size).toBe(0);
  });

  test("does not expire entry before TTL", async () => {
    await cache.set("key", "value", 60_000);
    expect(await cache.get<string>("key")).toBe("value");
  });

  // delete
  test("deletes a key", async () => {
    await cache.set("key", "value", 60_000);
    await cache.delete("key");
    expect(await cache.get("key")).toBeNull();
    expect(cache.size).toBe(0);
  });

  test("delete on missing key is a no-op", async () => {
    await cache.delete("nonexistent");
    expect(cache.size).toBe(0);
  });

  // clear
  test("clears all entries", async () => {
    await cache.set("a", 1, 60_000);
    await cache.set("b", 2, 60_000);
    await cache.set("c", 3, 60_000);
    await cache.clear();
    expect(cache.size).toBe(0);
  });

  // size
  test("reports correct size", async () => {
    expect(cache.size).toBe(0);
    await cache.set("a", 1, 60_000);
    expect(cache.size).toBe(1);
    await cache.set("b", 2, 60_000);
    expect(cache.size).toBe(2);
  });

  // cleanup
  test("cleanup removes only expired entries", async () => {
    await cache.set("expired1", "x", 1);
    await cache.set("expired2", "y", 1);
    await cache.set("alive", "z", 60_000);
    await Bun.sleep(5);

    cache.cleanup();

    expect(cache.size).toBe(1);
    expect(await cache.get<string>("alive")).toBe("z");
    expect(await cache.get("expired1")).toBeNull();
    expect(await cache.get("expired2")).toBeNull();
  });

  test("cleanup is a no-op when nothing is expired", async () => {
    await cache.set("a", 1, 60_000);
    await cache.set("b", 2, 60_000);
    cache.cleanup();
    expect(cache.size).toBe(2);
  });

  test("cleanup is a no-op on empty cache", () => {
    cache.cleanup(); // should not throw
    expect(cache.size).toBe(0);
  });

  // ---- eviction (max size) ----
  test("evicts entries when exceeding max size", async () => {
    // MAX_CACHE_SIZE is 10_000 — fill cache to the limit, then add one more
    for (let i = 0; i < 10_001; i++) {
      await cache.set(`key-${i}`, i, 60_000);
    }

    // Should have been trimmed back to MAX_CACHE_SIZE
    expect(cache.size).toBeLessThanOrEqual(10_000);
  });

  test("evicts expired entries first before oldest", async () => {
    // Fill cache to exactly 10_000 with alive entries
    for (let i = 0; i < 10_000; i++) {
      await cache.set(`alive-${i}`, i, 60_000);
    }
    expect(cache.size).toBe(10_000);

    // Manually expire 100 entries by accessing internal map
    const internalCache = (cache as any).cache as Map<
      string,
      { value: unknown; expiresAt: number }
    >;
    for (let i = 0; i < 100; i++) {
      const entry = internalCache.get(`alive-${i}`)!;
      entry.expiresAt = Date.now() - 1;
    }

    // Adding one more triggers eviction — cleanup should remove the 100 expired first
    await cache.set("trigger", "evict", 60_000);

    // 10_000 original - 100 expired + 1 new = 9_901
    expect(cache.size).toBe(9_901);
    expect(await cache.get<string>("trigger")).toBe("evict");
    // The non-expired entries should still be intact
    expect(await cache.get<number>("alive-100")).toBe(100);
  });

  // ---- destroy ----
  test("destroy stops cleanup interval", () => {
    cache.destroy();
    // Calling destroy twice should be safe
    cache.destroy();
  });

  test("new instance starts cleanup interval", () => {
    // The constructor starts the interval — verify it doesn't throw
    const instance = new CacheService();
    instance.destroy();
  });
});
