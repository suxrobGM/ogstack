import { z } from "zod/v4";

export const createApiKeySchema = z.object({
  name: z.string().min(1, "Name is required"),
  projectId: z.string(),
});

export type CreateApiKeyForm = z.infer<typeof createApiKeySchema>;
