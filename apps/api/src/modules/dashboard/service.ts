import { desc, eq } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { customers, tickets } from "../../database/schema/index.js";

export async function getWorkspaceInsights(database: Database, organizationId: string) {
  const [allTickets, customerRows, recentTickets] = await Promise.all([
    database
      .select({
        id: tickets.id,
        status: tickets.status,
        priority: tickets.priority,
        createdAt: tickets.createdAt,
      })
      .from(tickets)
      .where(eq(tickets.organizationId, organizationId)),
    database.select({ id: customers.id }).from(customers).where(eq(customers.organizationId, organizationId)),
    database
      .select({
        id: tickets.id,
        title: tickets.title,
        status: tickets.status,
        priority: tickets.priority,
        updatedAt: tickets.updatedAt,
        customerName: customers.name,
      })
      .from(tickets)
      .innerJoin(customers, eq(tickets.customerId, customers.id))
      .where(eq(tickets.organizationId, organizationId))
      .orderBy(desc(tickets.updatedAt))
      .limit(6),
  ]);
  const byStatus = { OPEN: 0, IN_PROGRESS: 0, WAITING_CUSTOMER: 0, RESOLVED: 0, CLOSED: 0 };
  const byPriority = { LOW: 0, NORMAL: 0, HIGH: 0, URGENT: 0 };
  for (const ticket of allTickets) {
    byStatus[ticket.status] += 1;
    byPriority[ticket.priority] += 1;
  }
  return {
    overview: {
      totalTickets: allTickets.length,
      activeTickets: byStatus.OPEN + byStatus.IN_PROGRESS + byStatus.WAITING_CUSTOMER,
      resolvedTickets: byStatus.RESOLVED + byStatus.CLOSED,
      customers: customerRows.length,
      createdLast7Days: allTickets.filter((ticket) => ticket.createdAt.getTime() >= Date.now() - 604800000)
        .length,
    },
    byStatus,
    byPriority,
    recentTickets,
  };
}
