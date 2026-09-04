import type { FastifyInstance } from "fastify";
import { db } from "../../database/client.js";
import { authenticate } from "../../shared/auth/authenticate.js";
import { parseRequest } from "../../shared/http/parse-request.js";
import { createOrganizationSchema, organizationParamsSchema } from "./schemas.js";
import { createOrganization, getOrganizationMembership, listUserOrganizations } from "./service.js";

export async function organizationRoutes(app: FastifyInstance) {
  app.get("/", async (request) => {
    const { userId } = await authenticate(request);
    return { organizations: await listUserOrganizations(db, userId) };
  });

  app.post("/", async (request, reply) => {
    const { userId } = await authenticate(request);
    const input = parseRequest(createOrganizationSchema, request.body);
    return reply.status(201).send(await createOrganization(db, userId, input));
  });

  app.get("/:organizationId", async (request) => {
    const { userId } = await authenticate(request);
    const { organizationId } = parseRequest(organizationParamsSchema, request.params);
    return { membership: await getOrganizationMembership(db, userId, organizationId) };
  });
}
