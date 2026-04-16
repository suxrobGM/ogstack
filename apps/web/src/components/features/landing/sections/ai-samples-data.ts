import manifest from "@public/images/ai-samples/samples.manifest.json" with { type: "json" };

export type SampleQuality = "standard" | "pro";

export interface AiSample {
  slug: string;
  sourceUrl: string;
  template: string;
  quality: SampleQuality;
  file: string;
  seeds: {
    headline: string;
    tagline: string;
    mood: string;
  };
}

interface Manifest {
  samples: AiSample[];
}

export const AI_SAMPLES: AiSample[] = (manifest as Manifest).samples;

export function aiSampleUrl(sample: AiSample): string {
  return `/images/ai-samples/${sample.file}`;
}

export function templateThumbFallback(template: string): string {
  return `/images/templates/${template}.webp`;
}
