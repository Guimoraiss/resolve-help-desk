import { and, eq } from "drizzle-orm";
import type { z } from "zod";
import type { Database } from "../../database/client.js";
import { customers } from "../../database/schema/index.js";
import { AppError } from "../../shared/errors/app-error.js";
import type { createCustomerSchema } from "./schemas.js";

type CreateCustomerInput = z.infer<typeof createCustomerSchema>;

export async function createCustomer(database: Database, organizationId: string, input: CreateCustomerInput) {
  try {
    const [customer] = await database
      .insert(customers)
      .values({ ...input, organizationId })
      .returning();
    return customer;
  } catch (error) {
    if (isUniqueViolation(error))
      throw new AppError("CUSTOMER_EMAIL_TAKEN", "A customer with this email already exists", 409);
    throw error;
  }
}

export async function listCustomers(database: Database, organizationId: string) {
  return database
    .select()
    .from(customers)
    .where(eq(customers.organizationId, organizationId))
    .orderBy(customers.createdAt);
}

export async function getCustomer(database: Database, organizationId: string, customerId: string) {
  const [customer] = await database
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.organizationId, organizationId)))
    .limit(1);
  if (!customer) throw new AppError("CUSTOMER_NOT_FOUND", "Customer not found", 404);
  return customer;
}

function isUniqueViolation(error: unknown): error is { code: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === "23505"
  );
}
