import { z } from "zod";
import { AppError } from "../errors/app-error.js";

export function parseRequest<TSchema extends z.ZodType>(schema: TSchema, input: unknown): z.infer<TSchema> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new AppError("VALIDATION_ERROR", "Request validation failed", 400);
  }
  return result.data;
}
