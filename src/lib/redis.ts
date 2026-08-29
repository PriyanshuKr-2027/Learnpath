/**
 * Upstash Redis REST client
 * Used for: atomic AI key rotation, response caching, rate limiting
 */
import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[Redis] UPSTASH_REDIS_REST_URL or TOKEN not set — running without Redis cache.");
    return null;
  }

  try {
    _redis = new Redis({ url, token });
    return _redis;
  } catch (e) {
    console.error("[Redis] Failed to initialize:", e);
    return null;
  }
}

/**
 * Atomic round-robin key index using Redis INCR.
 * Survives server restarts and is safe under concurrent requests.
 */
export async function getNextIndexAtomic(key: string, poolSize: number): Promise<number> {
  const redis = getRedis();
  if (!redis || poolSize === 0) return 0;

  try {
    const val = await redis.incr(key);
    return (val - 1) % poolSize;
  } catch {
    return 0;
  }
}

/**
 * Cache-aside helper — returns cached JSON or calls fetcher and caches result.
 */
export async function cachedFetch<T>(
  cacheKey: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  const redis = getRedis();

  if (redis) {
    try {
      const cached = await redis.get<T>(cacheKey);
      if (cached !== null && cached !== undefined) return cached;
    } catch {}
  }

  const fresh = await fetcher();

  if (redis) {
    try {
      await redis.setex(cacheKey, ttlSeconds, JSON.stringify(fresh));
    } catch {}
  }

  return fresh;
}
