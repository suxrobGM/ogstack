import { singleton } from "tsyringe";
import { logger } from "@/common/logger";

@singleton()
export class SmsService {
  private readonly apiKey: string | null;

  constructor() {
    this.apiKey = process.env.SMS_API_KEY ?? null;

    if (!this.apiKey) {
      logger.warn("SMS_API_KEY not set — SMS will be logged instead of sent");
    }
  }

  async send(phone: string, message: string): Promise<void> {
    if (!this.apiKey) {
      logger.info({ phone, message }, "SMS (dev mode — not sent)");
      return;
    }

    // TODO: integrate with real SMS provider (e.g. Eskiz.uz)
    logger.info({ phone }, "SMS sent");
  }
}
