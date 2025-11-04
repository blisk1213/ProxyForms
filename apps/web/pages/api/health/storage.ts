import type { NextApiRequest, NextApiResponse } from 'next';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { getMinioClient, Buckets } from '@/lib/storage';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = getMinioClient();

    // Test connection by listing buckets
    const command = new ListBucketsCommand({});
    const response = await client.send(command);

    const buckets = response.Buckets?.map((b) => b.Name) || [];

    // Check if required buckets exist
    const requiredBuckets = [Buckets.IMAGES, Buckets.MEDIA];
    const missingBuckets = requiredBuckets.filter((b) => !buckets.includes(b));

    return res.status(200).json({
      status: 'healthy',
      minio: {
        connected: true,
        buckets: buckets,
        requiredBuckets: requiredBuckets,
        missingBuckets: missingBuckets.length > 0 ? missingBuckets : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Storage health check error:', error);
    return res.status(500).json({
      status: 'unhealthy',
      message: 'Failed to connect to MinIO',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
  }
}
