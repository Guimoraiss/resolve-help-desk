import type { FastifyInstance } from "fastify";
import { db } from "../../database/client.js";
import { getOrganizationContext } from "../../shared/auth/organization-context.js";
import { getWorkspaceInsights } from "./service.js";
export async function dashboardRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const context = await getOrganizationContext(request);
    return { insights: await getWorkspaceInsights(db, context.organizationId) };
  });
}
