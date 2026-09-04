import { z } from "zod";

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  DATABASE_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(32).default("development-only-secret-change-before-production"),
});

export function loadEnvironment(source: NodeJS.ProcessEnv = process.env) {
  return environmentSchema.parse(source);
}
