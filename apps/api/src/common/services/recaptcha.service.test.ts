import { afterEach, beforeEach, describe, expect, it, mock } from "bun:test";
import { RecaptchaService } from "./recaptcha.service";

interface MockAssessmentResponse {
  tokenProperties?: { valid?: boolean; invalidReason?: string; action?: string };
  riskAnalysis?: { score?: number };
}

function installMockClient(response: MockAssessmentResponse | "throw") {
  const createAssessment = mock(() => {
    if (response === "throw") {
      return Promise.reject(new Error("grpc error"));
    }
    return Promise.resolve([response] as const);
  });

  const MockClient = class {
    projectPath(id: string) {
      return `projects/${id}`;
    }
    createAssessment = createAssessment;
  };

  return { MockClient, createAssessment };
}

describe("RecaptchaService", () => {
  const origProjectId = process.env.RECAPTCHA_PROJECT_ID;
  const origSiteKey = process.env.RECAPTCHA_SITE_KEY;
  const origMinScore = process.env.RECAPTCHA_MIN_SCORE;

  beforeEach(() => {
    process.env.RECAPTCHA_PROJECT_ID = "my-project";
    process.env.RECAPTCHA_SITE_KEY = "key-123";
    process.env.RECAPTCHA_MIN_SCORE = "0.5";
  });

  afterEach(() => {
    process.env.RECAPTCHA_PROJECT_ID = origProjectId;
    process.env.RECAPTCHA_SITE_KEY = origSiteKey;
    process.env.RECAPTCHA_MIN_SCORE = origMinScore;
  });

  it("skips verification when not configured (returns normally)", async () => {
    delete process.env.RECAPTCHA_PROJECT_ID;
    delete process.env.RECAPTCHA_SITE_KEY;

    const service = new RecaptchaService();
    await service.verify("t", "login");
  });

  it("passes verification when token is valid and score >= threshold", async () => {
    const service = new RecaptchaService();
    const { MockClient } = installMockClient({
      tokenProperties: { valid: true, action: "login" },
      riskAnalysis: { score: 0.9 },
    });

    (service as unknown as { client: unknown }).client = new MockClient();
    await service.verify("token", "login");
  });

  it("throws BadRequestError when assessment request fails", () => {
    const service = new RecaptchaService();
    const { MockClient } = installMockClient("throw");
    (service as unknown as { client: unknown }).client = new MockClient();

    expect(service.verify("t", "login")).rejects.toThrow(
      "reCAPTCHA verification is temporarily unavailable",
    );
  });

  it("throws BadRequestError when token is invalid", () => {
    const service = new RecaptchaService();
    const { MockClient } = installMockClient({
      tokenProperties: { valid: false, invalidReason: "EXPIRED" },
    });
    (service as unknown as { client: unknown }).client = new MockClient();

    expect(service.verify("t", "login")).rejects.toThrow("reCAPTCHA verification failed");
  });

  it("throws BadRequestError when action mismatches", () => {
    const service = new RecaptchaService();
    const { MockClient } = installMockClient({
      tokenProperties: { valid: true, action: "other" },
      riskAnalysis: { score: 0.9 },
    });
    (service as unknown as { client: unknown }).client = new MockClient();

    expect(service.verify("t", "login")).rejects.toThrow("reCAPTCHA verification failed");
  });

  it("throws BadRequestError when score is below threshold", () => {
    const service = new RecaptchaService();
    const { MockClient } = installMockClient({
      tokenProperties: { valid: true, action: "login" },
      riskAnalysis: { score: 0.1 },
    });
    (service as unknown as { client: unknown }).client = new MockClient();

    expect(service.verify("t", "login")).rejects.toThrow("reCAPTCHA verification failed");
  });
});
