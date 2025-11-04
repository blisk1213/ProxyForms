import Redis, { RedisOptions } from 'ioredis';

// Redis client singleton
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://:proxyforms_redis_password@localhost:6379';

    // Parse Redis URL
    const url = new URL(redisUrl);

    const options: RedisOptions = {
      host: url.hostname,
      port: parseInt(url.port) || 6379,
      password: url.password || undefined,
      // Retry strategy
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      // Connection timeout
      connectTimeout: 10000,
      // Enable offline queue
      enableOfflineQueue: true,
      // Maximum retry attempts
      maxRetriesPerRequest: 3,
      // Lazy connect (don't connect until first command)
      lazyConnect: true,
    };

    redis = new Redis(options);

    // Event handlers
    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err);
    });

    redis.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
  }

  return redis;
}

// Graceful shutdown
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
    console.log('Redis connection closed gracefully');
  }
}

// Health check
export async function checkRedisHealth(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.error('Redis health check failed:', error);
    return false;
  }
}

export default getRedisClient;
