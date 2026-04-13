import { container, singleton } from "tsyringe";
import { logger } from "@/common/logger";
import {
  IMAGE_PROVIDER_TOKEN,
  type ImageGenerateParams,
  type ImageProvider,
} from "./image-provider";

/** Façade that routes an image-generation request to the provider that
 *  advertises support for the requested model. Lets the rest of the codebase
 *  stay agnostic to which vendor is handling generation. */
@singleton()
export class ImageProviderService {
  private resolveProviders(): ImageProvider[] {
    try {
      return container.resolveAll<ImageProvider>(IMAGE_PROVIDER_TOKEN);
    } catch {
      return [];
    }
  }

  isEnabledForModel(model: string): boolean {
    return this.resolveProviders().some((p) => p.supportsModel(model) && p.isEnabled());
  }

  async generate(params: ImageGenerateParams): Promise<Buffer> {
    const providers = this.resolveProviders();
    const provider = providers.find((p) => p.supportsModel(params.model));

    if (!provider) {
      throw new Error(`No image provider registered for model "${params.model}"`);
    }
    if (!provider.isEnabled()) {
      throw new Error(`Image provider "${provider.id}" is not configured`);
    }

    logger.debug({ providerId: provider.id, model: params.model }, "Dispatching image request");
    return provider.generate(params);
  }
}
