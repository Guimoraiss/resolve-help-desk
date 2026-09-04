import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import type { Database } from "../../database/client.js";
import { auditEvents, ticketMessages } from "../../database/schema/index.js";
import { getTicket } from "../tickets/service.js";
import type { createTicketMessageSchema } from "./schemas.js";

type CreateMessageInput = z.infer<typeof createTicketMessageSchema>;

export async function createTicketMessage(
  database: Database,
  organizationId: string,
  ticketId: string,
  authorId: string,
  input: CreateMessageInput,
) {
  await getTicket(database, organizationId, ticketId);
  return database.transaction(async (transaction) => {
    const [message] = await transaction
      .insert(ticketMessages)
      .values({ ...input, organizationId, ticketId, authorId })
      .returning();
    await transaction.insert(auditEvents).values({
      organizationId,
      actorId: authorId,
      resourceType: "TICKET",
      resourceId: ticketId,
      eventType: input.type === "PUBLIC_REPLY" ? "PUBLIC_REPLY_CREATED" : "INTERNAL_NOTE_CREATED",
      metadata: { messageId: message.id },
    });
    return message;
  });
}

export async function listTicketMessages(database: Database, organizationId: string, ticketId: string) {
  await getTicket(database, organizationId, ticketId);
  return database
    .select()
    .from(ticketMessages)
    .where(and(eq(ticketMessages.organizationId, organizationId), eq(ticketMessages.ticketId, ticketId)))
    .orderBy(ticketMessages.createdAt);
}
