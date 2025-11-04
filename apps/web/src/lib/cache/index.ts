import { getRedisClient } from './redis';

export * from './redis';
export * from './blog-cache';

// Cache key prefix for namespacing
const KEY_PREFIX = 'proxyforms:';

/**
 * Cache TTL (Time To Live) in seconds
 */
export const CacheTTL = {
  ONE_MINUTE: 60,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  THIRTY_MINUTES: 1800,
  ONE_HOUR: 3600,
  SIX_HOURS: 21600,
  ONE_DAY: 86400,
  ONE_WEEK: 604800,
  ONE_MONTH: 2592000,
} as const;

/**
 * Generate a cache key with prefix
 */
export function cacheKey(...parts: (string | number)[]): string {
  return KEY_PREFIX + parts.join(':');
}

/**
 * Get value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedisClient();
    const value = await redis.get(cacheKey(key));

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
}

/**
 * Set value in cache with TTL
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttl: number = CacheTTL.FIVE_MINUTES
): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const serialized = JSON.stringify(value);

    await redis.setex(cacheKey(key), ttl, serialized);
    return true;
  } catch (error) {
    console.error('Cache set error:', error);
    return false;
  }
}

/**
 * Delete value from cache
 */
export async function cacheDel(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.del(cacheKey(key));
    return true;
  } catch (error) {
    console.error('Cache delete error:', error);
    return false;
  }
}

/**
 * Delete multiple keys matching a pattern
 */
export async function cacheDelPattern(pattern: string): Promise<number> {
  try {
    const redis = getRedisClient();
    const keys = await redis.keys(cacheKey(pattern));

    if (keys.length === 0) {
      return 0;
    }

    const deleted = await redis.del(...keys);
    return deleted;
  } catch (error) {
    console.error('Cache delete pattern error:', error);
    return 0;
  }
}

/**
 * Check if key exists in cache
 */
export async function cacheExists(key: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const exists = await redis.exists(cacheKey(key));
    return exists === 1;
  } catch (error) {
    console.error('Cache exists error:', error);
    return false;
  }
}

/**
 * Get TTL for a key
 */
export async function cacheTTL(key: string): Promise<number> {
  try {
    const redis = getRedisClient();
    const ttl = await redis.ttl(cacheKey(key));
    return ttl;
  } catch (error) {
    console.error('Cache TTL error:', error);
    return -1;
  }
}

/**
 * Get or set cache value (cache-aside pattern)
 */
export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = CacheTTL.FIVE_MINUTES
): Promise<T> {
  // Try to get from cache first
  const cached = await cacheGet<T>(key);

  if (cached !== null) {
    return cached;
  }

  // Cache miss - fetch data
  const data = await fetcher();

  // Store in cache (don't await to avoid blocking)
  cacheSet(key, data, ttl).catch((err) => {
    console.error('Failed to cache data:', err);
  });

  return data;
}

/**
 * Increment a counter in cache
 */
export async function cacheIncr(key: string, by: number = 1): Promise<number> {
  try {
    const redis = getRedisClient();
    const value = await redis.incrby(cacheKey(key), by);
    return value;
  } catch (error) {
    console.error('Cache increment error:', error);
    return 0;
  }
}

/**
 * Decrement a counter in cache
 */
export async function cacheDecr(key: string, by: number = 1): Promise<number> {
  try {
    const redis = getRedisClient();
    const value = await redis.decrby(cacheKey(key), by);
    return value;
  } catch (error) {
    console.error('Cache decrement error:', error);
    return 0;
  }
}

/**
 * Add item to a set
 */
export async function cacheSetAdd(key: string, ...members: string[]): Promise<number> {
  try {
    const redis = getRedisClient();
    const added = await redis.sadd(cacheKey(key), ...members);
    return added;
  } catch (error) {
    console.error('Cache set add error:', error);
    return 0;
  }
}

/**
 * Get all members of a set
 */
export async function cacheSetMembers(key: string): Promise<string[]> {
  try {
    const redis = getRedisClient();
    const members = await redis.smembers(cacheKey(key));
    return members;
  } catch (error) {
    console.error('Cache set members error:', error);
    return [];
  }
}

/**
 * Check if member exists in set
 */
export async function cacheSetIsMember(key: string, member: string): Promise<boolean> {
  try {
    const redis = getRedisClient();
    const isMember = await redis.sismember(cacheKey(key), member);
    return isMember === 1;
  } catch (error) {
    console.error('Cache set is member error:', error);
    return false;
  }
}

/**
 * Flush all cache (use with caution!)
 */
export async function cacheFlushAll(): Promise<boolean> {
  try {
    const redis = getRedisClient();
    await redis.flushdb();
    console.log('✅ Cache flushed successfully');
    return true;
  } catch (error) {
    console.error('Cache flush error:', error);
    return false;
  }
}

/**
 * Get cache statistics
 */
export async function cacheStats(): Promise<{
  keys: number;
  memory: string;
  hits?: number;
  misses?: number;
}> {
  try {
    const redis = getRedisClient();
    const info = await redis.info('stats');
    const dbsize = await redis.dbsize();

    // Parse stats from info string
    const stats: any = {};
    info.split('\r\n').forEach(line => {
      const [key, value] = line.split(':');
      if (key && value) {
        stats[key] = value;
      }
    });

    return {
      keys: dbsize,
      memory: stats.used_memory_human || 'N/A',
      hits: parseInt(stats.keyspace_hits) || 0,
      misses: parseInt(stats.keyspace_misses) || 0,
    };
  } catch (error) {
    console.error('Cache stats error:', error);
    return { keys: 0, memory: 'N/A' };
  }
}

// Export Redis client getter for advanced usage
export { getRedisClient };
