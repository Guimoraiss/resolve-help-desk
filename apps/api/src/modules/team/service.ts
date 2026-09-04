import { asc, eq } from "drizzle-orm";
import type { Database } from "../../database/client.js";
import { memberships, users } from "../../database/schema/index.js";
export async function listTeamMembers(database: Database, organizationId: string) {
  return database
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: memberships.role,
      joinedAt: memberships.createdAt,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.organizationId, organizationId))
    .orderBy(asc(memberships.createdAt));
}
