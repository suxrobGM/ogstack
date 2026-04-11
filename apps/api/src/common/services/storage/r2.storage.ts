import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import type { IImageStorage, StoredImage } from "./types";

@singleton()
export class R2ImageStorage implements IImageStorage {
  private readonly client: S3Client;
  private readonly bucketName = process.env.R2_BUCKET_NAME ?? "ogstack-images";
  private readonly publicUrl = process.env.R2_PUBLIC_URL ?? "";

  constructor() {
    const accountId = process.env.R2_ACCOUNT_ID ?? "";
    const accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";

    if (!accountId || !accessKeyId || !secretAccessKey) {
      logger.warn("R2 credentials not configured — R2 storage will not work");
    }

    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async store(key: string, buffer: Buffer, contentType: string): Promise<StoredImage> {
    const path = this.keyToPath(key);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: path,
        Body: buffer,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    const url = this.publicUrl ? `${this.publicUrl}/${path}` : path;

    logger.debug({ key, size: buffer.length }, "Image stored in R2");

    return { key, url, size: buffer.length };
  }

  async get(key: string): Promise<Buffer | null> {
    const path = this.keyToPath(key);

    try {
      const response = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucketName, Key: path }),
      );
      if (!response.Body) return null;
      return Buffer.from(await response.Body.transformToByteArray());
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    const path = this.keyToPath(key);

    await this.client.send(new DeleteObjectCommand({ Bucket: this.bucketName, Key: path }));

    logger.debug({ key }, "Image deleted from R2");
  }

  async exists(key: string): Promise<boolean> {
    const path = this.keyToPath(key);

    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.bucketName, Key: path }));
      return true;
    } catch {
      return false;
    }
  }

  private keyToPath(key: string): string {
    return `images/${key}.png`;
  }
}
