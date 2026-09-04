import type { FastifyInstance } from "fastify";
import { db } from "../../database/client.js";
import { getOrganizationContext } from "../../shared/auth/organization-context.js";
import { parseRequest } from "../../shared/http/parse-request.js";
import { getTicket } from "../tickets/service.js";
import { ticketParamsSchema } from "../tickets/schemas.js";
import { listTicketActivity } from "./service.js";

export async function auditRoutes(app: FastifyInstance) {
  app.get("/:ticketId/activity", async (request) => {
    const context = await getOrganizationContext(request);
    const { ticketId } = parseRequest(ticketParamsSchema, request.params);
    await getTicket(db, context.organizationId, ticketId);
    return { activity: await listTicketActivity(db, context.organizationId, ticketId) };
  });
}
