import { z } from "zod/v4";

export const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  domains: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
