import { z } from "zod";
import { ticketMessageTypes } from "@resolve/types";

export const createTicketMessageSchema = z.object({
  type: z.enum(ticketMessageTypes),
  content: z.string().trim().min(1).max(10_000),
});
