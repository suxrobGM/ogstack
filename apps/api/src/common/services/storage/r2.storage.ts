import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import type { IImageStorage, StoredImage } from "./types";

@singleton()
export class R2ImageStorage implements IImageStorage {
  private readonly accountId = process.env.R2_ACCOUNT_ID ?? "";
  private readonly bucketName = process.env.R2_BUCKET_NAME ?? "ogstack-images";
  private readonly accessKeyId = process.env.R2_ACCESS_KEY_ID ?? "";
  private readonly secretAccessKey = process.env.R2_SECRET_ACCESS_KEY ?? "";
  private readonly publicUrl = process.env.R2_PUBLIC_URL ?? "";

  constructor() {
    if (!this.accountId || !this.accessKeyId || !this.secretAccessKey) {
      logger.warn("R2 credentials not configured — R2 storage will not work");
    }
  }

  async store(key: string, buffer: Buffer, contentType: string): Promise<StoredImage> {
    const path = this.keyToPath(key);

    const response = await fetch(this.s3Url(path), {
      method: "PUT",
      headers: {
        ...this.authHeaders("PUT", path),
        "Content-Type": contentType,
        "Content-Length": String(buffer.length),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: buffer,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`R2 upload failed: ${response.status} ${text}`);
    }

    const url = this.publicUrl ? `${this.publicUrl}/${path}` : `${this.s3Url(path)}`;

    logger.debug({ key, size: buffer.length }, "Image stored in R2");

    return { key, url, size: buffer.length };
  }

  async get(key: string): Promise<Buffer | null> {
    const path = this.keyToPath(key);

    const response = await fetch(this.s3Url(path), {
      headers: this.authHeaders("GET", path),
    });

    if (!response.ok) return null;
    return Buffer.from(await response.arrayBuffer());
  }

  async delete(key: string): Promise<void> {
    const path = this.keyToPath(key);

    await fetch(this.s3Url(path), {
      method: "DELETE",
      headers: this.authHeaders("DELETE", path),
    });

    logger.debug({ key }, "Image deleted from R2");
  }

  async exists(key: string): Promise<boolean> {
    const path = this.keyToPath(key);

    const response = await fetch(this.s3Url(path), {
      method: "HEAD",
      headers: this.authHeaders("HEAD", path),
    });

    return response.ok;
  }

  private keyToPath(key: string): string {
    return `images/${key}.png`;
  }

  private s3Url(path: string): string {
    return `https://${this.accountId}.r2.cloudflarestorage.com/${this.bucketName}/${path}`;
  }

  private authHeaders(method: string, _path: string): Record<string, string> {
    // Basic auth using S3-compatible API key authentication
    // For production, use AWS Signature V4 or the @aws-sdk/client-s3 package
    const credentials = Buffer.from(`${this.accessKeyId}:${this.secretAccessKey}`).toString(
      "base64",
    );
    return {
      Authorization: `Basic ${credentials}`,
    };
  }
}
