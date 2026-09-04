import { describe, expect, it } from "vitest";
import { assertTicketTransition } from "../src/modules/tickets/status-transition.js";

describe("ticket status transitions", () => {
  it("allows the defined lifecycle", () => {
    expect(() => assertTicketTransition("OPEN", "IN_PROGRESS")).not.toThrow();
    expect(() => assertTicketTransition("IN_PROGRESS", "RESOLVED")).not.toThrow();
    expect(() => assertTicketTransition("RESOLVED", "CLOSED")).not.toThrow();
  });
  it("rejects invalid status changes", () => {
    expect(() => assertTicketTransition("OPEN", "CLOSED")).toThrow("Cannot change");
    expect(() => assertTicketTransition("CLOSED", "OPEN")).toThrow("Cannot change");
  });
});
