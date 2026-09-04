import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { loadEnvironment } from "../config/env.js";
import * as schema from "./schema/index.js";

const environment = loadEnvironment();
const client = postgres(environment.DATABASE_URL ?? "postgresql://resolve:resolve@localhost:5432/resolve", {
  max: 10,
});

export const db = drizzle(client, { schema });
export type Database = typeof db;
