import type { FastifyInstance } from "fastify";
import { db } from "../../database/client.js";
import { getOrganizationContext } from "../../shared/auth/organization-context.js";
import { requireRole } from "../../shared/auth/authorization.js";
import { parseRequest } from "../../shared/http/parse-request.js";
import { createCustomerSchema, customerParamsSchema } from "./schemas.js";
import { createCustomer, getCustomer, listCustomers } from "./service.js";

export async function customerRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const context = await getOrganizationContext(request);
    return { customers: await listCustomers(db, context.organizationId) };
  });
  app.post("/", async (request, reply) => {
    const context = await getOrganizationContext(request);
    requireRole(context.role, "ADMIN");
    const input = parseRequest(createCustomerSchema, request.body);
    return reply.status(201).send({ customer: await createCustomer(db, context.organizationId, input) });
  });
  app.get("/:customerId", async (request) => {
    const context = await getOrganizationContext(request);
    const { customerId } = parseRequest(customerParamsSchema, request.params);
    return { customer: await getCustomer(db, context.organizationId, customerId) };
  });
}
