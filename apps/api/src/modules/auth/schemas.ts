import { z } from "zod";
import { organizationSlugSchema } from "@resolve/validation";

const passwordSchema = z.string().min(12).max(72);

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  organizationName: z.string().trim().min(2).max(120),
  organizationSlug: organizationSlugSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
});
