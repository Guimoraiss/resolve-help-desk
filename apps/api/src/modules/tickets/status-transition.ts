import type { TicketStatus } from "@resolve/types";
import { AppError } from "../../shared/errors/app-error.js";

const allowedTransitions: Record<TicketStatus, readonly TicketStatus[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["WAITING_CUSTOMER", "RESOLVED"],
  WAITING_CUSTOMER: ["IN_PROGRESS"],
  RESOLVED: ["CLOSED", "OPEN"],
  CLOSED: [],
};

export function assertTicketTransition(current: TicketStatus, next: TicketStatus) {
  if (!allowedTransitions[current].includes(next)) {
    throw new AppError(
      "INVALID_TICKET_TRANSITION",
      `Cannot change ticket status from ${current} to ${next}`,
      422,
    );
  }
}
