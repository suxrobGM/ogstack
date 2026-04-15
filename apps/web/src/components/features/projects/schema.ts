import { isValidDomain, parseDomainList } from "@ogstack/shared";
import { z } from "zod/v4";

export const projectFormSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name must be 100 characters or fewer"),
    domains: z.string().min(1, "At least one domain is required"),
  })
  .refine(
    (data) => {
      const parts = parseDomainList(data.domains);
      return parts.length > 0 && parts.every(isValidDomain);
    },
    {
      message: "Enter valid domains like example.com, separated by commas",
      path: ["domains"],
    },
  );
