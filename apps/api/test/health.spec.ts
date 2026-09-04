import { afterAll, describe, expect, it } from "vitest";
import { buildApp } from "../src/app.js";

const app = await buildApp();

afterAll(async () => app.close());

describe("GET /api/health", () => {
  it("returns the service status", async () => {
    const response = await app.inject({ method: "GET", url: "/api/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});
