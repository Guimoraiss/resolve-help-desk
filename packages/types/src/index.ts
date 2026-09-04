export const membershipRoles = ["OWNER", "ADMIN", "AGENT"] as const;
export type MembershipRole = (typeof membershipRoles)[number];

export const ticketStatuses = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"] as const;
export type TicketStatus = (typeof ticketStatuses)[number];

export const ticketPriorities = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;
export type TicketPriority = (typeof ticketPriorities)[number];

export type ApiError = {
  error: { code: string; message: string };
};

export const ticketMessageTypes = ["PUBLIC_REPLY", "INTERNAL_NOTE"] as const;
export type TicketMessageType = (typeof ticketMessageTypes)[number];
