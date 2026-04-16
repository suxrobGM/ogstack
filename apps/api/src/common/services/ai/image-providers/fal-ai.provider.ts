import { singleton } from "tsyringe";
import { BadRequestError } from "@/common/errors";
import { logger } from "@/common/logger";
import type { ImageGenerateParams, ImageProvider } from "./image-provider";

/** Text-to-image models served by the FAL provider.
 *  - `schnell` — FLUX.1 schnell, ~$0.003/MP, ~1–2s. Best for budget tier.
 *  - `flux2`   — FLUX.2 dev,    ~$0.012/MP, ~3–5s. Balanced quality/cost.
 *  - `flux2Pro`— FLUX.2 pro,    ~$0.03/MP,  ~4–8s. Studio-grade. */
export const FAL_MODELS = {
  schnell: "fal-ai/flux/schnell",
  flux2: "fal-ai/flux-2",
  flux2Pro: "fal-ai/flux-2-pro",
} as const;

export type FalModel = (typeof FAL_MODELS)[keyof typeof FAL_MODELS];

const SUPPORTED_MODELS = new Set<string>(Object.values(FAL_MODELS));
const FAL_TIMEOUT = 30_000;

interface FalSubmitResponse {
  request_id: string;
  status_url?: string;
  response_url?: string;
}

interface FalStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
}

interface FalResultResponse {
  images?: { url: string; content_type?: string }[];
}

@singleton()
export class FalAiProvider implements ImageProvider {
  readonly id = "fal";
  private readonly apiKey = process.env.FAL_API_KEY ?? null;

  isEnabled(): boolean {
    return Boolean(this.apiKey);
  }

  supportsModel(model: string): boolean {
    return SUPPORTED_MODELS.has(model);
  }

  async generate(params: ImageGenerateParams): Promise<Buffer> {
    if (!this.apiKey) {
      throw new BadRequestError("FAL.ai is not configured on this server.");
    }
    const { model, prompt } = params;
    if (!prompt.trim()) {
      throw new BadRequestError("AI prompt is empty.");
    }
    if (!this.supportsModel(model)) {
      throw new BadRequestError(`FAL provider does not support model "${model}".`);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FAL_TIMEOUT);
    const startMs = performance.now();

    try {
      const submit = await this.submit(model, prompt, controller.signal);
      const requestId = submit.request_id;
      const statusUrl =
        submit.status_url ?? `https://queue.fal.run/${model}/requests/${requestId}/status`;
      const resultUrl =
        submit.response_url ?? `https://queue.fal.run/${model}/requests/${requestId}`;

      await this.waitUntilDone(statusUrl, controller.signal);
      const result = await this.fetchResult(resultUrl, controller.signal);

      const imageUrl = result.images?.[0]?.url;
      if (!imageUrl) {
        throw new Error("FAL response contained no image");
      }

      const pngBuffer = await this.downloadImage(imageUrl, controller.signal);
      const elapsedMs = Math.round(performance.now() - startMs);
      logger.info({ model, elapsedMs, promptLength: prompt.length }, "FAL image generated");
      return pngBuffer;
    } finally {
      clearTimeout(timer);
    }
  }

  private async submit(
    model: string,
    prompt: string,
    signal: AbortSignal,
  ): Promise<FalSubmitResponse> {
    const response = await fetch(`https://queue.fal.run/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      signal,
      body: JSON.stringify({
        prompt,
        image_size: "landscape_16_9",
        num_images: 1,
        enable_safety_checker: true,
        output_format: "png",
        // Higher guidance + more steps = noticeably better text rendering on
        // FLUX.2 dev/pro. Schnell ignores these (distilled 4-step model).
        guidance_scale: 4.5,
        num_inference_steps: 32,
        seed: Math.floor(Math.random() * 2_147_483_647),
      }),
    });

    if (!response.ok) {
      throw new Error(`FAL submit failed: HTTP ${response.status}`);
    }
    return (await response.json()) as FalSubmitResponse;
  }

  private async waitUntilDone(statusUrl: string, signal: AbortSignal): Promise<void> {
    while (true) {
      if (signal.aborted) {
        throw new Error("FAL polling aborted");
      }

      const response = await fetch(statusUrl, {
        headers: { Authorization: `Key ${this.apiKey}` },
        signal,
      });
      if (!response.ok) {
        throw new Error(`FAL status failed: HTTP ${response.status}`);
      }
      const status = (await response.json()) as FalStatusResponse;

      if (status.status === "COMPLETED") {
        return;
      }
      if (status.status === "FAILED") {
        throw new Error("FAL job failed");
      }

      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  private async fetchResult(resultUrl: string, signal: AbortSignal): Promise<FalResultResponse> {
    const response = await fetch(resultUrl, {
      headers: { Authorization: `Key ${this.apiKey}` },
      signal,
    });
    if (!response.ok) {
      throw new Error(`FAL result fetch failed: HTTP ${response.status}`);
    }
    return (await response.json()) as FalResultResponse;
  }

  private async downloadImage(url: string, signal: AbortSignal): Promise<Buffer> {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`FAL image download failed: HTTP ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
