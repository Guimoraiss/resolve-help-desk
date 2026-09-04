import type { FastifyInstance } from "fastify";
import { db } from "../../database/client.js";
import { getOrganizationContext } from "../../shared/auth/organization-context.js";
import { listTeamMembers } from "./service.js";
export async function teamRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const context = await getOrganizationContext(request);
    return { members: await listTeamMembers(db, context.organizationId) };
  });
}
