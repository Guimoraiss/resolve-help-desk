import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { memberships, organizations, users } from "../../database/schema/index.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { z } from "zod";
import type { loginSchema, registerSchema } from "./schemas.js";

type RegisterInput = z.infer<typeof registerSchema>;
type LoginInput = z.infer<typeof loginSchema>;

export async function registerUser(database: Database, input: RegisterInput) {
  const passwordHash = await bcrypt.hash(input.password, 12);
  try {
    return await database.transaction(async (transaction) => {
      const [user] = await transaction
        .insert(users)
        .values({ name: input.name, email: input.email, passwordHash })
        .returning();
      const [organization] = await transaction
        .insert(organizations)
        .values({ name: input.organizationName, slug: input.organizationSlug })
        .returning();
      const [membership] = await transaction
        .insert(memberships)
        .values({ userId: user.id, organizationId: organization.id, role: "OWNER" })
        .returning();
      return { user, organization, membership };
    });
  } catch (error) {
    if (isUniqueViolation(error))
      throw new AppError("CONFLICT", "Email or organization slug is already in use", 409);
    throw error;
  }
}

export async function authenticateUser(database: Database, input: LoginInput) {
  const [user] = await database.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError("INVALID_CREDENTIALS", "Email or password is incorrect", 401);
  }
  return user;
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}
