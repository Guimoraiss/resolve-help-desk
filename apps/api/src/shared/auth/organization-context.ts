import type { FastifyRequest } from "fastify";
import { z } from "zod";
import { db } from "../../database/client.js";
import { AppError } from "../errors/app-error.js";
import { authenticate, type AuthenticatedUser } from "./authenticate.js";
import { getOrganizationMembership } from "../../modules/organizations/service.js";

const organizationIdSchema = z.string().uuid();

export async function getOrganizationContext(
  request: FastifyRequest,
): Promise<AuthenticatedUser & { organizationId: string; role: "OWNER" | "ADMIN" | "AGENT" }> {
  const user = await authenticate(request);
  const header = request.headers["x-organization-id"];
  const organizationId = organizationIdSchema.safeParse(header);
  if (!organizationId.success)
    throw new AppError("ORGANIZATION_CONTEXT_REQUIRED", "A valid x-organization-id header is required", 400);
  const membership = await getOrganizationMembership(db, user.userId, organizationId.data);
  return { ...user, organizationId: membership.organizationId, role: membership.role };
}
