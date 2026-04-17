import { singleton } from "tsyringe";
import { logger } from "@/common/logger";
import { CacheService } from "@/common/services/cache";
import { LocalImageStorage } from "./local.storage";
import { R2ImageStorage } from "./r2.storage";
import type { IImageStorage, StoredImage } from "./types";

const IMAGE_CACHE_TTL = 60 * 60 * 1000; // 1 hour in-memory cache for buffer reads

@singleton()
export class ImageStorageService {
  private readonly backend: IImageStorage;

  constructor(private readonly cache: CacheService) {
    const useR2 = Boolean(process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID);
    this.backend = useR2 ? new R2ImageStorage() : new LocalImageStorage();

    logger.info("Image storage backend: %s", useR2 ? "R2" : "local");
  }

  async store(key: string, buffer: Buffer, contentType = "image/png"): Promise<StoredImage> {
    const result = await this.backend.store(key, buffer, contentType);
    await this.cache.set(`img:${key}`, buffer, IMAGE_CACHE_TTL);
    return result;
  }

  async get(key: string): Promise<Buffer | null> {
    const cached = await this.cache.get<Buffer>(`img:${key}`);
    if (cached) return cached;

    const buffer = await this.backend.get(key);
    if (buffer) {
      await this.cache.set(`img:${key}`, buffer, IMAGE_CACHE_TTL);
    }
    return buffer;
  }

  /**
   * Deletes either a single object or every object under a prefix. Keys with
   * an extension in the final segment are treated as single-file deletes;
   * keys ending in `/` or with no extension are treated as prefix deletes
   * (used to evict entire icon-set directories).
   */
  async delete(key: string): Promise<void> {
    await this.backend.delete(key);
    await this.cache.delete(`img:${key}`);
  }

  async exists(key: string): Promise<boolean> {
    const cached = await this.cache.get<Buffer>(`img:${key}`);
    if (cached) return true;
    return this.backend.exists(key);
  }
}
