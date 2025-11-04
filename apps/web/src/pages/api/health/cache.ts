import type { NextApiRequest, NextApiResponse } from 'next';
import { checkRedisHealth, cacheStats } from '@/lib/cache';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const isHealthy = await checkRedisHealth();

    if (!isHealthy) {
      return res.status(503).json({
        status: 'unhealthy',
        message: 'Redis is not responding',
      });
    }

    const stats = await cacheStats();

    return res.status(200).json({
      status: 'healthy',
      redis: {
        connected: true,
        keys: stats.keys,
        memory: stats.memory,
        hits: stats.hits,
        misses: stats.misses,
        hitRate: stats.hits && stats.misses
          ? `${((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(2)}%`
          : 'N/A',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cache health check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check cache health',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
