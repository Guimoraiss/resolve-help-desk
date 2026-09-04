import { and, desc, eq, isNull } from "drizzle-orm";
import type { TicketPriority, TicketStatus } from "@resolve/types";
import type { z } from "zod";
import type { Database } from "../../database/client.js";
import {
  auditEvents,
  customers,
  memberships,
  ticketAssignments,
  tickets,
} from "../../database/schema/index.js";
import { AppError } from "../../shared/errors/app-error.js";
import { getCustomer } from "../customers/service.js";
import type { createTicketSchema, listTicketsSchema } from "./schemas.js";
import { assertTicketTransition } from "./status-transition.js";

type CreateTicketInput = z.infer<typeof createTicketSchema>;
type ListTicketsInput = z.infer<typeof listTicketsSchema>;

export async function createTicket(
  database: Database,
  organizationId: string,
  actorId: string,
  input: CreateTicketInput,
) {
  await getCustomer(database, organizationId, input.customerId);
  return database.transaction(async (transaction) => {
    const [ticket] = await transaction
      .insert(tickets)
      .values({ ...input, organizationId })
      .returning();
    await transaction.insert(auditEvents).values({
      organizationId,
      actorId,
      resourceType: "TICKET",
      resourceId: ticket.id,
      eventType: "TICKET_CREATED",
    });
    return ticket;
  });
}

export async function listTickets(database: Database, organizationId: string, query: ListTicketsInput) {
  const conditions = [eq(tickets.organizationId, organizationId)];
  if (query.status) conditions.push(eq(tickets.status, query.status));
  const items = await database
    .select({ ticket: tickets, customerName: customers.name })
    .from(tickets)
    .innerJoin(customers, eq(tickets.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(tickets.updatedAt))
    .limit(query.pageSize)
    .offset((query.page - 1) * query.pageSize);
  return { items, page: query.page, pageSize: query.pageSize };
}

export async function getTicket(database: Database, organizationId: string, ticketId: string) {
  const [ticket] = await database
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, ticketId), eq(tickets.organizationId, organizationId)))
    .limit(1);
  if (!ticket) throw new AppError("TICKET_NOT_FOUND", "Ticket not found", 404);
  return ticket;
}

export async function changeTicketStatus(
  database: Database,
  organizationId: string,
  ticketId: string,
  actorId: string,
  nextStatus: TicketStatus,
) {
  const ticket = await getTicket(database, organizationId, ticketId);
  assertTicketTransition(ticket.status, nextStatus);
  const lifecycleDates = getLifecycleDates(nextStatus);
  return database.transaction(async (transaction) => {
    const [updated] = await transaction
      .update(tickets)
      .set({ status: nextStatus, updatedAt: new Date(), ...lifecycleDates })
      .where(
        and(
          eq(tickets.id, ticketId),
          eq(tickets.organizationId, organizationId),
          eq(tickets.status, ticket.status),
        ),
      )
      .returning();
    if (!updated)
      throw new AppError(
        "TICKET_UPDATE_CONFLICT",
        "Ticket was changed by another agent. Refresh and try again.",
        409,
      );
    await transaction.insert(auditEvents).values({
      organizationId,
      actorId,
      resourceType: "TICKET",
      resourceId: ticketId,
      eventType: "STATUS_CHANGED",
      metadata: { from: ticket.status, to: nextStatus },
    });
    return updated;
  });
}

export async function changeTicketPriority(
  database: Database,
  organizationId: string,
  ticketId: string,
  actorId: string,
  priority: TicketPriority,
) {
  const ticket = await getTicket(database, organizationId, ticketId);
  if (ticket.priority === priority) return ticket;
  return database.transaction(async (transaction) => {
    const [updated] = await transaction
      .update(tickets)
      .set({ priority, updatedAt: new Date() })
      .where(
        and(
          eq(tickets.id, ticketId),
          eq(tickets.organizationId, organizationId),
          eq(tickets.priority, ticket.priority),
        ),
      )
      .returning();
    if (!updated)
      throw new AppError(
        "TICKET_UPDATE_CONFLICT",
        "Ticket was changed by another agent. Refresh and try again.",
        409,
      );
    await transaction.insert(auditEvents).values({
      organizationId,
      actorId,
      resourceType: "TICKET",
      resourceId: ticketId,
      eventType: "PRIORITY_CHANGED",
      metadata: { from: ticket.priority, to: priority },
    });
    return updated;
  });
}

export async function assignTicket(
  database: Database,
  organizationId: string,
  ticketId: string,
  actorId: string,
  agentId: string | null,
  onlyIfUnassigned = false,
) {
  const ticket = await getTicket(database, organizationId, ticketId);
  if (agentId) await assertOrganizationMember(database, organizationId, agentId);
  if (onlyIfUnassigned && ticket.assignedAgentId)
    throw new AppError("TICKET_ALREADY_ASSIGNED", "Ticket is already assigned", 409);
  return database.transaction(async (transaction) => {
    const assignmentState = ticket.assignedAgentId
      ? eq(tickets.assignedAgentId, ticket.assignedAgentId)
      : isNull(tickets.assignedAgentId);
    const conditions = [
      eq(tickets.id, ticketId),
      eq(tickets.organizationId, organizationId),
      assignmentState,
    ];
    const [updated] = await transaction
      .update(tickets)
      .set({ assignedAgentId: agentId, updatedAt: new Date() })
      .where(and(...conditions))
      .returning();
    if (!updated)
      throw new AppError(
        "TICKET_UPDATE_CONFLICT",
        "Ticket assignment changed by another agent. Refresh and try again.",
        409,
      );
    if (ticket.assignedAgentId)
      await transaction
        .update(ticketAssignments)
        .set({ unassignedAt: new Date() })
        .where(
          and(
            eq(ticketAssignments.organizationId, organizationId),
            eq(ticketAssignments.ticketId, ticketId),
            isNull(ticketAssignments.unassignedAt),
          ),
        );
    if (agentId)
      await transaction
        .insert(ticketAssignments)
        .values({ organizationId, ticketId, agentId, assignedById: actorId });
    await transaction.insert(auditEvents).values({
      organizationId,
      actorId,
      resourceType: "TICKET",
      resourceId: ticketId,
      eventType: agentId ? "TICKET_ASSIGNED" : "TICKET_UNASSIGNED",
      metadata: { previousAgentId: ticket.assignedAgentId, agentId },
    });
    return updated;
  });
}

async function assertOrganizationMember(database: Database, organizationId: string, userId: string) {
  const [member] = await database
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.organizationId, organizationId), eq(memberships.userId, userId)))
    .limit(1);
  if (!member)
    throw new AppError("ASSIGNEE_NOT_IN_ORGANIZATION", "Assignee must belong to this organization", 422);
}

function getLifecycleDates(status: TicketStatus) {
  if (status === "RESOLVED") return { resolvedAt: new Date(), closedAt: null };
  if (status === "CLOSED") return { closedAt: new Date() };
  if (status === "OPEN") return { resolvedAt: null, closedAt: null };
  return {};
}
