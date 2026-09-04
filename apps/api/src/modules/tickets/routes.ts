import type { FastifyInstance } from "fastify";
import { db } from "../../database/client.js";
import { getOrganizationContext } from "../../shared/auth/organization-context.js";
import { requireRole } from "../../shared/auth/authorization.js";
import { parseRequest } from "../../shared/http/parse-request.js";
import {
  assignTicket,
  changeTicketPriority,
  changeTicketStatus,
  createTicket,
  getTicket,
  listTickets,
} from "./service.js";
import {
  createTicketSchema,
  listTicketsSchema,
  ticketParamsSchema,
  updateTicketAssigneeSchema,
  updateTicketPrioritySchema,
  updateTicketStatusSchema,
} from "./schemas.js";

export async function ticketRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const context = await getOrganizationContext(request);
    const query = parseRequest(listTicketsSchema, request.query);
    return { tickets: await listTickets(db, context.organizationId, query) };
  });
  app.post("/", async (request, reply) => {
    const context = await getOrganizationContext(request);
    const input = parseRequest(createTicketSchema, request.body);
    return reply
      .status(201)
      .send({ ticket: await createTicket(db, context.organizationId, context.userId, input) });
  });
  app.get("/:ticketId", async (request) => {
    const context = await getOrganizationContext(request);
    const { ticketId } = parseRequest(ticketParamsSchema, request.params);
    return { ticket: await getTicket(db, context.organizationId, ticketId) };
  });
  app.patch("/:ticketId/status", async (request) => {
    const context = await getOrganizationContext(request);
    const { ticketId } = parseRequest(ticketParamsSchema, request.params);
    const { status } = parseRequest(updateTicketStatusSchema, request.body);
    return { ticket: await changeTicketStatus(db, context.organizationId, ticketId, context.userId, status) };
  });
  app.patch("/:ticketId/priority", async (request) => {
    const context = await getOrganizationContext(request);
    requireRole(context.role, "ADMIN");
    const { ticketId } = parseRequest(ticketParamsSchema, request.params);
    const { priority } = parseRequest(updateTicketPrioritySchema, request.body);
    return {
      ticket: await changeTicketPriority(db, context.organizationId, ticketId, context.userId, priority),
    };
  });
  app.patch("/:ticketId/assignee", async (request) => {
    const context = await getOrganizationContext(request);
    requireRole(context.role, "ADMIN");
    const { ticketId } = parseRequest(ticketParamsSchema, request.params);
    const { agentId } = parseRequest(updateTicketAssigneeSchema, request.body);
    return { ticket: await assignTicket(db, context.organizationId, ticketId, context.userId, agentId) };
  });
  app.post("/:ticketId/assignee/claim", async (request) => {
    const context = await getOrganizationContext(request);
    const { ticketId } = parseRequest(ticketParamsSchema, request.params);
    return {
      ticket: await assignTicket(db, context.organizationId, ticketId, context.userId, context.userId, true),
    };
  });
}
