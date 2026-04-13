import { container } from "tsyringe";
import { logger } from "@/common/logger";
import { IMAGE_PROVIDER_TOKEN, type ImageProvider } from "./image-providers";
import { PROMPT_PROVIDER_TOKEN, type PromptProvider } from "./prompt-providers";

/** Logs which image providers and prompt providers are configured. Called
 *  once at boot so operators can see at a glance what the server will use. */
export function logAiServicesAtStartup(): void {
  const imageProviders = safeResolveAll<ImageProvider>(IMAGE_PROVIDER_TOKEN);
  const promptProviders = safeResolveAll<PromptProvider>(PROMPT_PROVIDER_TOKEN);

  const imageSummary = imageProviders.map((p) => ({ id: p.id, enabled: p.isEnabled() }));
  const promptSummary = promptProviders.map((p) => ({ id: p.id, enabled: p.isEnabled() }));

  const preferredPrompt = process.env.PROMPT_PROVIDER?.trim().toLowerCase() || null;
  const activePrompt =
    promptProviders.find((p) => preferredPrompt && p.id === preferredPrompt && p.isEnabled())?.id ??
    promptProviders.find((p) => p.isEnabled())?.id ??
    null;

  logger.info(
    {
      imageProviders: imageSummary,
      promptProviders: promptSummary,
      preferredPromptProvider: preferredPrompt,
      activePromptProvider: activePrompt,
    },
    "AI services initialized",
  );

  if (!imageProviders.some((p) => p.isEnabled())) {
    logger.warn(
      "No image providers are enabled — aiGenerated requests will fall back to templates.",
    );
  }
  if (!promptProviders.some((p) => p.isEnabled())) {
    logger.warn("No prompt providers are enabled — AI prompts will use title-only subjects.");
  }
}

function safeResolveAll<T>(token: symbol): T[] {
  try {
    return container.resolveAll<T>(token);
  } catch {
    return [];
  }
}
