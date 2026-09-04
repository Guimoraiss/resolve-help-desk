import type { FastifyInstance } from "fastify";
import { db } from "../../database/client.js";
import { getOrganizationContext } from "../../shared/auth/organization-context.js";
import { parseRequest } from "../../shared/http/parse-request.js";
import { ticketParamsSchema } from "../tickets/schemas.js";
import { createTicketMessageSchema } from "./schemas.js";
import { createTicketMessage, listTicketMessages } from "./service.js";

export async function messageRoutes(app: FastifyInstance) {
  app.get("/:ticketId/messages", async (request) => {
    const context = await getOrganizationContext(request);
    const { ticketId } = parseRequest(ticketParamsSchema, request.params);
    return { messages: await listTicketMessages(db, context.organizationId, ticketId) };
  });
  app.post("/:ticketId/messages", async (request, reply) => {
    const context = await getOrganizationContext(request);
    const { ticketId } = parseRequest(ticketParamsSchema, request.params);
    const input = parseRequest(createTicketMessageSchema, request.body);
    return reply.status(201).send({
      message: await createTicketMessage(db, context.organizationId, ticketId, context.userId, input),
    });
  });
}
