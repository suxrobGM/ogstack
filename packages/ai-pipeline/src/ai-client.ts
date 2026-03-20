import { fal } from '@fal-ai/client';

export interface FluxImageResult {
  imageUrl: string;
  width: number;
  height: number;
}

fal.config({
  credentials: process.env['FAL_API_KEY'],
});

export async function generateImageWithFlux(
  prompt: string,
  width = 1200,
  height = 630,
): Promise<FluxImageResult> {
  const result = await fal.subscribe('fal-ai/flux/schnell', {
    input: {
      prompt,
      image_size: { width, height },
      num_inference_steps: 4,
      num_images: 1,
    },
  });

  // Type assertion needed — fal SDK returns unknown output shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const output = result as any;
  const image = output?.data?.images?.[0] ?? output?.images?.[0];
  if (!image?.url) {
    throw new Error('No image returned from Flux');
  }

  return {
    imageUrl: image.url as string,
    width: (image.width as number | undefined) ?? width,
    height: (image.height as number | undefined) ?? height,
  };
}
