import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import type { IImageStorage, StoredImage } from "./types";

@singleton()
export class LocalImageStorage implements IImageStorage {
  private readonly baseDir: string;
  private readonly baseUrl: string;

  constructor() {
    this.baseDir = resolve(process.env.UPLOAD_DIR ?? "./uploads", "images");
    this.baseUrl = "/uploads/images";
    void this.ensureDir();
  }

  async store(key: string, buffer: Buffer, _contentType: string): Promise<StoredImage> {
    await this.ensureDir();
    const filePath = this.keyToPath(key);
    await Bun.write(filePath, buffer);

    logger.debug({ key, size: buffer.length }, "Image stored locally");

    return {
      key,
      url: `${this.baseUrl}/${key}.png`,
      size: buffer.length,
    };
  }

  async get(key: string): Promise<Buffer | null> {
    try {
      const data = await readFile(this.keyToPath(key));
      return Buffer.from(data);
    } catch {
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await rm(this.keyToPath(key));
      logger.debug({ key }, "Image deleted locally");
    } catch {
      // File may not exist
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      await stat(this.keyToPath(key));
      return true;
    } catch {
      return false;
    }
  }

  private keyToPath(key: string): string {
    return resolve(this.baseDir, `${key}.png`);
  }

  private async ensureDir(): Promise<void> {
    await mkdir(this.baseDir, { recursive: true });
  }
}
