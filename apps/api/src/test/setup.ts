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
