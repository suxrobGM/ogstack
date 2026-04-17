export interface StoredImage {
  key: string;
  url: string;
  size: number;
}

/**
 * Image Storage Interface
 * Implemented by local file storage (dev) and R2 (production).
 *
 * Keys are full relative paths including extension (e.g. `abc123.png`,
 * `abc123/favicon.ico`). The backend does not append anything. `delete`
 * accepts either an exact key or a prefix ending with `/`.
 */
export interface IImageStorage {
  store(key: string, buffer: Buffer, contentType: string): Promise<StoredImage>;
  get(key: string): Promise<Buffer | null>;
  /** Exact key if the key has an extension, or prefix delete when key ends with `/`. */
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
