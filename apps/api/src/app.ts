import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import Fastify from "fastify";
import { loadEnvironment } from "./config/env.js";
import { AppError } from "./shared/errors/app-error.js";
import { healthRoutes } from "./modules/health/routes.js";
import { authRoutes } from "./modules/auth/routes.js";
import { organizationRoutes } from "./modules/organizations/routes.js";
import { customerRoutes } from "./modules/customers/routes.js";
import { ticketRoutes } from "./modules/tickets/routes.js";
import { messageRoutes } from "./modules/messages/routes.js";
import { auditRoutes } from "./modules/audit/routes.js";
import { dashboardRoutes } from "./modules/dashboard/routes.js";
import { teamRoutes } from "./modules/team/routes.js";

export async function buildApp() {
  const environment = loadEnvironment();
  const app = Fastify({ logger: environment.NODE_ENV !== "test" });

  await app.register(cors, {
    origin: environment.NODE_ENV === "development" ? true : environment.WEB_ORIGIN,
  });
  await app.register(jwt, { secret: environment.JWT_SECRET });
  await app.register(healthRoutes, { prefix: "/api" });
  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(organizationRoutes, { prefix: "/api/organizations" });
  await app.register(customerRoutes, { prefix: "/api/customers" });
  await app.register(ticketRoutes, { prefix: "/api/tickets" });
  await app.register(messageRoutes, { prefix: "/api/tickets" });
  await app.register(auditRoutes, { prefix: "/api/tickets" });
  await app.register(dashboardRoutes, { prefix: "/api/dashboard" });
  await app.register(teamRoutes, { prefix: "/api/team" });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({ error: { code: error.code, message: error.message } });
    }

    app.log.error(error);
    return reply
      .status(500)
      .send({ error: { code: "INTERNAL_SERVER_ERROR", message: "Internal server error" } });
  });

  return app;
}
