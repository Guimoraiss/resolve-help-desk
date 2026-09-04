import { z } from "zod";
import { ticketPriorities, ticketStatuses } from "@resolve/types";
import { paginationSchema } from "@resolve/validation";

export const createTicketSchema = z.object({
  customerId: z.string().uuid(),
  title: z.string().trim().min(3).max(240),
  description: z.string().trim().min(1).max(10_000),
  priority: z.enum(ticketPriorities).default("NORMAL"),
});

export const ticketParamsSchema = z.object({ ticketId: z.string().uuid() });
export const updateTicketStatusSchema = z.object({ status: z.enum(ticketStatuses) });
export const updateTicketPrioritySchema = z.object({ priority: z.enum(ticketPriorities) });
export const updateTicketAssigneeSchema = z.object({ agentId: z.string().uuid().nullable() });
export const listTicketsSchema = paginationSchema.extend({ status: z.enum(ticketStatuses).optional() });
