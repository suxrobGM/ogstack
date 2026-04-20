import { z } from "zod/v4";

export const socialPreviewSchema = z.object({
  url: z.url({ message: "Enter a valid http(s) URL" }),
});

export type SocialPreviewValues = z.infer<typeof socialPreviewSchema>;
