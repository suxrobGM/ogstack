import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { logger } from "@/common/logger";

/** Verifies tokens against Google reCAPTCHA Enterprise. Skips when unconfigured. */
@singleton()
export class RecaptchaService {
  private warnedAboutMissingConfig = false;
  private readonly projectId = process.env.RECAPTCHA_PROJECT_ID;
  private readonly siteKey = process.env.RECAPTCHA_SITE_KEY;
  private client: RecaptchaEnterpriseServiceClient | null = null;

  async verify(token: string, action: string): Promise<void> {
    if (!this.projectId || !this.siteKey) {
      if (!this.warnedAboutMissingConfig) {
        logger.warn(
          "reCAPTCHA Enterprise not configured - skipping verification. Set RECAPTCHA_PROJECT_ID, RECAPTCHA_SITE_KEY, and GOOGLE_APPLICATION_CREDENTIALS to enable.",
        );
        this.warnedAboutMissingConfig = true;
      }
      return;
    }

    const minScore = parseFloat(process.env.RECAPTCHA_MIN_SCORE ?? "0.5");
    const client = this.getClient();

    let assessment;
    try {
      const [response] = await client.createAssessment({
        parent: client.projectPath(this.projectId),
        assessment: {
          event: { token, siteKey: this.siteKey, expectedAction: action },
        },
      });

      assessment = response;
    } catch (error) {
      logger.warn({ error }, "reCAPTCHA Enterprise assessment request failed");
      throw new BadRequestError("reCAPTCHA verification is temporarily unavailable");
    }

    const tokenProperties = assessment.tokenProperties;
    if (!tokenProperties?.valid) {
      logger.warn(
        { invalidReason: tokenProperties?.invalidReason },
        "reCAPTCHA Enterprise token invalid",
      );
      throw new BadRequestError("reCAPTCHA verification failed");
    }

    if (tokenProperties.action && tokenProperties.action !== action) {
      logger.warn(
        { expected: action, actual: tokenProperties.action },
        "reCAPTCHA Enterprise action mismatch",
      );
      throw new BadRequestError("reCAPTCHA verification failed");
    }

    const score = assessment.riskAnalysis?.score;
    if (typeof score === "number" && score < minScore) {
      logger.warn({ score, minScore }, "reCAPTCHA Enterprise score below threshold");
      throw new BadRequestError("reCAPTCHA verification failed");
    }
  }

  private getClient(): RecaptchaEnterpriseServiceClient {
    if (!this.client) {
      this.client = new RecaptchaEnterpriseServiceClient();
    }
    return this.client;
  }
}
