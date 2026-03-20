import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

let _s3: S3Client | null = null;

function getS3(): S3Client {
  if (!_s3) {
    const endpoint = process.env['CLOUDFLARE_R2_ENDPOINT'];
    const accessKeyId = process.env['CLOUDFLARE_R2_KEY'];
    const secretAccessKey = process.env['CLOUDFLARE_R2_SECRET'];
    if (!endpoint || !accessKeyId || !secretAccessKey) {
      throw new Error('R2 environment variables are not set');
    }
    _s3 = new S3Client({
      region: 'auto',
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });
  }
  return _s3;
}

function getBucket(): string {
  const bucket = process.env['CLOUDFLARE_R2_BUCKET'];
  if (!bucket) throw new Error('CLOUDFLARE_R2_BUCKET is not set');
  return bucket;
}

export async function uploadImage(key: string, buffer: Buffer): Promise<string> {
  const s3 = getS3();
  await s3.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );

  const endpoint = process.env['CLOUDFLARE_R2_ENDPOINT'] ?? '';
  return `${endpoint}/${getBucket()}/${key}`;
}

export async function deleteImage(key: string): Promise<void> {
  const s3 = getS3();
  await s3.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }));
}

export async function getPresignedUrl(key: string, expiresIn = 3600): Promise<string> {
  const s3 = getS3();
  const command = new GetObjectCommand({ Bucket: getBucket(), Key: key });
  return getSignedUrl(s3, command, { expiresIn });
}

export function buildImageKey(workspaceId: string, url: string): string {
  const hash = Buffer.from(url).toString('base64url').slice(0, 32);
  return `${workspaceId}/${hash}.png`;
}
