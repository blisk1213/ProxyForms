import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getMinioClient, Buckets } from './minio';
import { nanoid } from 'nanoid';

export * from './minio';

/**
 * Upload file to MinIO
 */
export async function uploadFile(params: {
  file: Buffer | Uint8Array | Blob;
  bucket?: string;
  key?: string;
  contentType?: string;
  metadata?: Record<string, string>;
}): Promise<{
  success: boolean;
  key: string;
  url: string;
  error?: string;
}> {
  try {
    const client = getMinioClient();
    const bucket = params.bucket || Buckets.IMAGES;

    // Generate unique key if not provided
    const key = params.key || `${nanoid()}-${Date.now()}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: params.file,
      ContentType: params.contentType || 'application/octet-stream',
      Metadata: params.metadata,
    });

    await client.send(command);

    // Construct public URL
    const publicUrl = getPublicUrl(bucket, key);

    return {
      success: true,
      key,
      url: publicUrl,
    };
  } catch (error) {
    console.error('File upload error:', error);
    return {
      success: false,
      key: '',
      url: '',
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

/**
 * Get presigned URL for temporary access
 */
export async function getPresignedUrl(params: {
  bucket: string;
  key: string;
  expiresIn?: number; // seconds, default 1 hour
  download?: boolean;
}): Promise<string | null> {
  try {
    const client = getMinioClient();
    const expiresIn = params.expiresIn || 3600;

    const command = new GetObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      ResponseContentDisposition: params.download ? 'attachment' : undefined,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Presigned URL generation error:', error);
    return null;
  }
}

/**
 * Get presigned upload URL
 */
export async function getPresignedUploadUrl(params: {
  bucket: string;
  key: string;
  contentType: string;
  expiresIn?: number;
}): Promise<string | null> {
  try {
    const client = getMinioClient();
    const expiresIn = params.expiresIn || 3600;

    const command = new PutObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
      ContentType: params.contentType,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Presigned upload URL generation error:', error);
    return null;
  }
}

/**
 * Delete file from MinIO
 */
export async function deleteFile(params: {
  bucket: string;
  key: string;
}): Promise<boolean> {
  try {
    const client = getMinioClient();

    const command = new DeleteObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('File deletion error:', error);
    return false;
  }
}

/**
 * Delete multiple files
 */
export async function deleteFiles(params: {
  bucket: string;
  keys: string[];
}): Promise<{ deleted: number; failed: number }> {
  let deleted = 0;
  let failed = 0;

  for (const key of params.keys) {
    const success = await deleteFile({ bucket: params.bucket, key });
    if (success) {
      deleted++;
    } else {
      failed++;
    }
  }

  return { deleted, failed };
}

/**
 * Check if file exists
 */
export async function fileExists(params: {
  bucket: string;
  key: string;
}): Promise<boolean> {
  try {
    const client = getMinioClient();

    const command = new HeadObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
    });

    await client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Get file metadata
 */
export async function getFileMetadata(params: {
  bucket: string;
  key: string;
}): Promise<{
  size: number;
  contentType: string;
  lastModified: Date;
  metadata?: Record<string, string>;
} | null> {
  try {
    const client = getMinioClient();

    const command = new HeadObjectCommand({
      Bucket: params.bucket,
      Key: params.key,
    });

    const response = await client.send(command);

    return {
      size: response.ContentLength || 0,
      contentType: response.ContentType || 'application/octet-stream',
      lastModified: response.LastModified || new Date(),
      metadata: response.Metadata,
    };
  } catch (error) {
    console.error('Get file metadata error:', error);
    return null;
  }
}

/**
 * List files in a bucket with prefix
 */
export async function listFiles(params: {
  bucket: string;
  prefix?: string;
  maxKeys?: number;
}): Promise<Array<{
  key: string;
  size: number;
  lastModified: Date;
}>> {
  try {
    const client = getMinioClient();

    const command = new ListObjectsV2Command({
      Bucket: params.bucket,
      Prefix: params.prefix,
      MaxKeys: params.maxKeys || 1000,
    });

    const response = await client.send(command);

    return (response.Contents || []).map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
    }));
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

/**
 * Copy file within MinIO
 */
export async function copyFile(params: {
  sourceBucket: string;
  sourceKey: string;
  destinationBucket: string;
  destinationKey: string;
}): Promise<boolean> {
  try {
    const client = getMinioClient();

    const command = new CopyObjectCommand({
      CopySource: `/${params.sourceBucket}/${params.sourceKey}`,
      Bucket: params.destinationBucket,
      Key: params.destinationKey,
    });

    await client.send(command);
    return true;
  } catch (error) {
    console.error('File copy error:', error);
    return false;
  }
}

/**
 * Get public URL for a file (assumes bucket is public)
 */
export function getPublicUrl(bucket: string, key: string): string {
  const minioUrl = process.env.NEXT_PUBLIC_MINIO_URL || 'http://localhost:9000';
  return `${minioUrl}/${bucket}/${key}`;
}

/**
 * Upload image with optimization metadata
 */
export async function uploadImage(params: {
  file: Buffer | Uint8Array | Blob;
  blogId: string;
  filename?: string;
  contentType?: string;
}): Promise<{
  success: boolean;
  key: string;
  url: string;
  error?: string;
}> {
  const key = params.filename
    ? `${params.blogId}/${params.filename}`
    : `${params.blogId}/${nanoid()}-${Date.now()}`;

  return uploadFile({
    file: params.file,
    bucket: Buckets.IMAGES,
    key,
    contentType: params.contentType || 'image/jpeg',
    metadata: {
      blogId: params.blogId,
      uploadedAt: new Date().toISOString(),
    },
  });
}

/**
 * Delete all files for a blog
 */
export async function deleteBlogFiles(blogId: string): Promise<{ deleted: number; failed: number }> {
  const files = await listFiles({
    bucket: Buckets.IMAGES,
    prefix: `${blogId}/`,
  });

  const keys = files.map((f) => f.key);

  return deleteFiles({
    bucket: Buckets.IMAGES,
    keys,
  });
}
