export interface StoredImage {
  key: string;
  url: string;
  size: number;
}

/**
 * Image Storage Interface
 * Implemented by local file storage (dev) and R2 (production).
 */
export interface IImageStorage {
  store(key: string, buffer: Buffer, contentType: string): Promise<StoredImage>;
  get(key: string): Promise<Buffer | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
