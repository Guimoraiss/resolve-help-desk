import { and, eq } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { memberships, organizations } from "../../database/schema/index.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { z } from "zod";
import type { createOrganizationSchema } from "./schemas.js";

type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export async function listUserOrganizations(database: Database, userId: string) {
  return database
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.organizationId, organizations.id))
    .where(eq(memberships.userId, userId));
}

export async function createOrganization(database: Database, userId: string, input: CreateOrganizationInput) {
  try {
    return await database.transaction(async (transaction) => {
      const [organization] = await transaction.insert(organizations).values(input).returning();
      const [membership] = await transaction
        .insert(memberships)
        .values({ userId, organizationId: organization.id, role: "OWNER" })
        .returning();
      return { organization, membership };
    });
  } catch (error) {
    if (isUniqueViolation(error))
      throw new AppError("ORGANIZATION_SLUG_TAKEN", "Organization slug is already in use", 409);
    throw error;
  }
}

export async function getOrganizationMembership(database: Database, userId: string, organizationId: string) {
  const [membership] = await database
    .select({ role: memberships.role, organizationId: memberships.organizationId })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.organizationId, organizationId)))
    .limit(1);
  if (!membership) throw new AppError("ORGANIZATION_ACCESS_DENIED", "Organization access denied", 403);
  return membership;
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}
