import { describe, expect, it } from "vitest";
import { requireRole } from "../src/shared/auth/authorization.js";

describe("requireRole", () => {
  it("allows roles that meet the required level", () => {
    expect(() => requireRole("OWNER", "ADMIN")).not.toThrow();
    expect(() => requireRole("ADMIN", "AGENT")).not.toThrow();
  });

  it("denies roles below the required level", () => {
    expect(() => requireRole("AGENT", "ADMIN")).toThrow("permission");
  });
});
