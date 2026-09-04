import { and, eq } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { auditEvents } from "../../database/schema/index.js";

type AuditEventInput = {
  organizationId: string;
  actorId: string;
  resourceType: "TICKET";
  resourceId: string;
  eventType: string;
  metadata?: Record<string, string | null>;
};

export async function recordAuditEvent(database: Database, event: AuditEventInput) {
  const [createdEvent] = await database
    .insert(auditEvents)
    .values({ ...event, metadata: event.metadata ?? {} })
    .returning();
  return createdEvent;
}

export async function listTicketActivity(database: Database, organizationId: string, ticketId: string) {
  return database
    .select()
    .from(auditEvents)
    .where(and(eq(auditEvents.organizationId, organizationId), eq(auditEvents.resourceId, ticketId)))
    .orderBy(auditEvents.createdAt);
}
