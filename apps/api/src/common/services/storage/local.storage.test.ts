import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { LocalImageStorage } from "./local.storage";

describe("LocalImageStorage", () => {
  let tempDir: string;
  let storage: LocalImageStorage;
  const origUpload = process.env.UPLOAD_DIR;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), "ogstack-storage-"));
    process.env.UPLOAD_DIR = tempDir;
    storage = new LocalImageStorage();
  });

  afterAll(async () => {
    process.env.UPLOAD_DIR = origUpload;
  });

  it("stores a buffer and returns a URL and size", async () => {
    const buf = Buffer.from("hello");
    const result = await storage.store("a/b.png", buf, "image/png");
    expect(result.key).toBe("a/b.png");
    expect(result.size).toBe(5);
    expect(result.url).toBe("/uploads/images/a/b.png");
  });

  it("reads back a stored buffer with get()", async () => {
    await storage.store("read.png", Buffer.from("abc"), "image/png");
    const read = await storage.get("read.png");
    expect(read?.toString()).toBe("abc");
  });

  it("returns null for missing key", async () => {
    const result = await storage.get("no-such.png");
    expect(result).toBeNull();
  });

  it("reports exists correctly", async () => {
    await storage.store("yes.png", Buffer.from("x"), "image/png");
    expect(await storage.exists("yes.png")).toBe(true);
    expect(await storage.exists("no.png")).toBe(false);
  });

  it("deletes a stored file", async () => {
    await storage.store("kill.png", Buffer.from("x"), "image/png");
    expect(await storage.exists("kill.png")).toBe(true);
    await storage.delete("kill.png");
    expect(await storage.exists("kill.png")).toBe(false);
  });

  it("delete on missing key does not throw", async () => {
    await storage.delete("never-existed.png");
  });

  it("stores under a prefix path and preserves nested directories", async () => {
    await storage.store("nested/deep/path/image.png", Buffer.from("deep"), "image/png");
    const read = await storage.get("nested/deep/path/image.png");
    expect(read?.toString()).toBe("deep");

    await rm(resolve(tempDir), { recursive: true, force: true });
  });
});
