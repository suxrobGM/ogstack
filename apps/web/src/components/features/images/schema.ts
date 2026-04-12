import { z } from "zod/v4";

export const imageEditFormSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

export type ImageEditFormValues = z.infer<typeof imageEditFormSchema>;

export const TEMPLATE_CATEGORIES = [
  "TECH",
  "MARKETING",
  "MINIMAL",
  "CREATIVE",
  "BUSINESS",
  "DOCUMENTATION",
  "SOCIAL",
] as const;

export type TemplateCategoryValue = (typeof TEMPLATE_CATEGORIES)[number];
