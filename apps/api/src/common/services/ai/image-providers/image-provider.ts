/**
 * Abstraction over AI text-to-image providers (FAL.ai Flux today; Replicate,
 * Stability, OpenAI, etc. tomorrow). Providers turn a prompt into a PNG.
 */
/** FAL's `image_size` parameter — added here because it's the one dimension
 *  knob most providers expose. Defaults to the landscape OG/hero ratio. */
export type ImageSize =
  | "landscape_16_9"
  | "landscape_4_3"
  | "portrait_4_3"
  | "portrait_16_9"
  | "square"
  | "square_hd";

export interface ImageGenerateParams {
  /**
   * Provider-specific model identifier (e.g. "fal-ai/flux/schnell"). Callers
   * resolve the model from the user's plan before calling `generate`.
   */
  model: string;
  prompt: string;
  /** Provider hint for output aspect ratio. Defaults to `landscape_16_9`. */
  imageSize?: ImageSize;
}

export interface ImageProvider {
  /** Short identifier for logs and DB (e.g. "fal"). */
  readonly id: string;

  /**
   * True when the provider is configured (API keys present). When false,
   * callers should fall back to template rendering.
   */
  isEnabled(): boolean;

  /**
   * Reports whether `model` is one this provider can serve. Used when the DI
   * container holds multiple providers.
   */
  supportsModel(model: string): boolean;

  /**
   * Generates a single PNG for the given prompt + model. Throws on timeout,
   * auth failure, or provider error — caller decides whether to fall back.
   */
  generate(params: ImageGenerateParams): Promise<Buffer>;
}

/**
 * DI token for resolving *all* registered image providers. Use
 * `container.resolveAll(IMAGE_PROVIDER_TOKEN)` to get every provider.
 */
export const IMAGE_PROVIDER_TOKEN = Symbol("ImageProvider");
