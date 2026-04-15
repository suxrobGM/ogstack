import { z } from "zod/v4";

export const auditFormSchema = z.object({
  url: z.url("Enter a valid URL (including https://)."),
  includeAi: z.boolean(),
});

export type AuditFormValues = z.infer<typeof auditFormSchema>;
