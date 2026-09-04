import type { FastifyRequest } from "fastify";
import { AppError } from "../errors/app-error.js";

export type AuthenticatedUser = { userId: string };

export async function authenticate(request: FastifyRequest): Promise<AuthenticatedUser> {
  try {
    const token = await request.jwtVerify<AuthenticatedUser>();
    return token;
  } catch {
    throw new AppError("UNAUTHORIZED", "Authentication is required", 401);
  }
}
