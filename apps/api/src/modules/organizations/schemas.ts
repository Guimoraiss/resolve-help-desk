import { z } from "zod";
import { organizationSlugSchema } from "@resolve/validation";

export const createOrganizationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: organizationSlugSchema,
});

export const organizationParamsSchema = z.object({ organizationId: z.string().uuid() });
