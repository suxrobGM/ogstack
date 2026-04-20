import { isValidDomain } from "@ogstack/shared";
import { z } from "zod/v4";

export const projectFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
  domains: z.array(z.string()).refine((arr) => arr.every(isValidDomain), {
    message: "Each entry must be a bare hostname like example.com",
  }),
});
