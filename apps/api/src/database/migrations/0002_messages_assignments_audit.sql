CREATE TYPE "public"."ticket_message_type" AS ENUM ('PUBLIC_REPLY', 'INTERNAL_NOTE');

CREATE TABLE "ticket_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "ticket_id" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE cascade,
  "author_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "type" "ticket_message_type" NOT NULL, "content" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE "ticket_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "ticket_id" uuid NOT NULL REFERENCES "tickets"("id") ON DELETE cascade,
  "agent_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "assigned_by_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE restrict,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "unassigned_at" timestamp with time zone
);
CREATE TABLE "audit_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_id" uuid NOT NULL REFERENCES "organizations"("id") ON DELETE cascade,
  "actor_id" uuid REFERENCES "users"("id") ON DELETE set null,
  "resource_type" text NOT NULL, "resource_id" uuid NOT NULL, "event_type" text NOT NULL,
  "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX "ticket_messages_organization_ticket_created_index" ON "ticket_messages" USING btree ("organization_id", "ticket_id", "created_at");
CREATE INDEX "ticket_assignments_organization_ticket_index" ON "ticket_assignments" USING btree ("organization_id", "ticket_id");
CREATE INDEX "audit_events_organization_resource_created_index" ON "audit_events" USING btree ("organization_id", "resource_id", "created_at");
