import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
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
    const filePath = this.keyToPath(key);
    await mkdir(dirname(filePath), { recursive: true });
    await Bun.write(filePath, buffer);

    logger.debug({ key, size: buffer.length }, "Stored locally");

    return {
      key,
      url: `${this.baseUrl}/${key}`,
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
    const target = this.keyToPath(key);
    try {
      // rm with recursive handles both single files and prefix directories.
      await rm(target, { recursive: true, force: true });
      logger.debug({ key }, "Deleted locally");
    } catch {
      // path may not exist
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
    return resolve(this.baseDir, key);
  }

  private async ensureDir(): Promise<void> {
    await mkdir(this.baseDir, { recursive: true });
  }
}
