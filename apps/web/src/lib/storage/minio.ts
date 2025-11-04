import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

// MinIO client singleton
let minioClient: S3Client | null = null;

export interface MinioConfig {
  endpoint: string;
  port: number;
  useSSL: boolean;
  accessKey: string;
  secretKey: string;
  region?: string;
}

export function getMinioConfig(): MinioConfig {
  return {
    endpoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT || '9000'),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ROOT_USER || 'proxyforms',
    secretKey: process.env.MINIO_ROOT_PASSWORD || 'proxyforms_minio_password',
    region: process.env.MINIO_REGION || 'us-east-1',
  };
}

export function getMinioClient(): S3Client {
  if (!minioClient) {
    const config = getMinioConfig();

    const s3Config: S3ClientConfig = {
      endpoint: `${config.useSSL ? 'https' : 'http'}://${config.endpoint}:${config.port}`,
      region: config.region,
      credentials: {
        accessKeyId: config.accessKey,
        secretAccessKey: config.secretKey,
      },
      forcePathStyle: true, // Required for MinIO
    };

    minioClient = new S3Client(s3Config);

    console.log('✅ MinIO client initialized:', {
      endpoint: s3Config.endpoint,
      region: config.region,
    });
  }

  return minioClient;
}

// Bucket names from environment
export const Buckets = {
  IMAGES: process.env.MINIO_BUCKET_IMAGES || 'proxyforms-images',
  MEDIA: process.env.MINIO_BUCKET_MEDIA || 'proxyforms-media',
} as const;

export default getMinioClient;
