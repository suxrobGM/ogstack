import "reflect-metadata";
import { mock } from "bun:test";

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
