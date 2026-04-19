import "reflect-metadata";
import { mock } from "bun:test";
import * as jose from "jose";
import * as passwordUtils from "@/common/utils/password";

/**
 * Capture real module exports BEFORE any test file calls mock.module().
 * Bun's mock.module() is process-global and persists across test files, so
 * tests that mock "jose" or "@/common/utils/password" would otherwise leak
 * into jwt.test.ts and password.test.ts. Tests that mock these must restore
 * them in afterAll via restoreMockedModules().
 */
const originalModules: Record<string, unknown> = {
  jose: { ...jose },
  "@/common/utils/password": { ...passwordUtils },
};

export function restoreMockedModules(...names: Array<keyof typeof originalModules | string>) {
  for (const name of names) {
    const original = originalModules[name];
    if (original) {
      mock.module(name, () => original);
    }
  }
}

const mockLogger = {
  logger: {
    info: mock(() => {}),
    warn: mock(() => {}),
    error: mock(() => {}),
    debug: mock(() => {}),
  },
};

mock.module("@/common/logger", () => mockLogger);

mock.module("satori", () => ({
  default: mock(() => Promise.resolve("<svg></svg>")),
}));

mock.module("@resvg/resvg-js", () => ({
  Resvg: class MockResvg {
    render() {
      return { asPng: () => new Uint8Array([0x89, 0x50, 0x4e, 0x47]) };
    }
  },
}));
