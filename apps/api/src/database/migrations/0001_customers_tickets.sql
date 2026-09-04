CREATE TYPE "public"."ticket_status" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');
CREATE TYPE "public"."ticket_priority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

CREATE TABLE "customers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "name" text NOT NULL, "email" text NOT NULL, "phone" text, "company_name" text, "country" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL, "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "tickets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "customer_id" uuid NOT NULL REFERENCES "customers"("id") ON DELETE restrict,
  "assigned_agent_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "title" text NOT NULL, "description" text NOT NULL, "status" "ticket_status" DEFAULT 'OPEN' NOT NULL,
  "priority" "ticket_priority" DEFAULT 'NORMAL' NOT NULL, "resolved_at" timestamp with time zone, "closed_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL, "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE UNIQUE INDEX "customers_organization_email_unique" ON "customers" USING btree ("organization_id", "email");
CREATE INDEX "customers_organization_created_at_index" ON "customers" USING btree ("organization_id", "created_at");
CREATE INDEX "tickets_organization_status_index" ON "tickets" USING btree ("organization_id", "status");
CREATE INDEX "tickets_organization_assignee_index" ON "tickets" USING btree ("organization_id", "assigned_agent_id");
CREATE INDEX "tickets_organization_customer_index" ON "tickets" USING btree ("organization_id", "customer_id");
CREATE INDEX "tickets_organization_created_at_index" ON "tickets" USING btree ("organization_id", "created_at");
