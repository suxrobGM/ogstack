import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { logger } from "@/common/logger";
import { SmsService } from "./sms.service";

describe("SmsService", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  describe("when SMS_API_KEY is not set", () => {
    let service: SmsService;

    beforeEach(() => {
      delete process.env.SMS_API_KEY;
      (logger.warn as ReturnType<typeof mock>).mockClear();
      (logger.info as ReturnType<typeof mock>).mockClear();
      service = new SmsService();
    });

    it("should warn about missing API key on construction", () => {
      expect(logger.warn).toHaveBeenCalled();
    });

    it("should log instead of sending", async () => {
      await service.send("+998901234567", "Your code: 123456");

      expect(logger.info).toHaveBeenCalledWith(
        { phone: "+998901234567", message: "Your code: 123456" },
        expect.stringContaining("dev mode"),
      );
    });

    it("should not throw", async () => {
      expect(service.send("+998901234567", "test")).resolves.toBeUndefined();
    });
  });

  describe("when SMS_API_KEY is set", () => {
    let service: SmsService;

    beforeEach(() => {
      process.env.SMS_API_KEY = "test-sms-key";
      (logger.warn as ReturnType<typeof mock>).mockClear();
      (logger.info as ReturnType<typeof mock>).mockClear();
      service = new SmsService();
    });

    it("should not warn about missing API key", () => {
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it("should log SMS sent", async () => {
      await service.send("+998901234567", "Your code: 123456");

      expect(logger.info).toHaveBeenCalledWith({ phone: "+998901234567" }, "SMS sent");
    });
  });
});
