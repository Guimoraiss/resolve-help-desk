import type { FastifyInstance } from "fastify";
import { db } from "../../database/client.js";
import { authenticate } from "../../shared/auth/authenticate.js";
import { parseRequest } from "../../shared/http/parse-request.js";
import { authenticateUser, createDemoSession, registerUser } from "./service.js";
import { loginSchema, registerSchema } from "./schemas.js";

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", async (request, reply) => {
    const input = parseRequest(registerSchema, request.body);
    const result = await registerUser(db, input);
    const accessToken = app.jwt.sign({ userId: result.user.id });
    return reply.status(201).send({
      accessToken,
      user: publicUser(result.user),
      organization: result.organization,
      membership: result.membership,
    });
  });

  app.post("/login", async (request) => {
    const input = parseRequest(loginSchema, request.body);
    const user = await authenticateUser(db, input);
    return { accessToken: app.jwt.sign({ userId: user.id }), user: publicUser(user) };
  });

  app.post("/demo", async () => {
    const result = await createDemoSession(db);
    return {
      accessToken: app.jwt.sign({ userId: result.user.id }),
      user: publicUser(result.user),
      organization: result.organization,
      membership: result.membership,
    };
  });

  app.get("/me", async (request) => ({ user: await authenticate(request) }));
}

function publicUser(user: { id: string; name: string; email: string }) {
  return { id: user.id, name: user.name, email: user.email };
}
