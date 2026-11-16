-- Consultancy appointments are a first-class scheduling surface, separate from
-- tasks. A session can later be converted into billable work (convertedTaskId).
-- Idempotent so it can be re-run safely alongside DB_SYNC=true.
BEGIN;

DO $$
BEGIN
  CREATE TYPE "appointments_status_enum" AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'RESCHEDULED'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "consultantId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  -- Central Hub owns businesses; this is a cross-system identifier.
  "clientBusinessId" uuid NOT NULL,
  "title" varchar NOT NULL,
  "notes" text,
  "scheduledAt" timestamptz NOT NULL,
  "durationMinutes" integer NOT NULL DEFAULT 60,
  "meetingUrl" varchar,
  "status" "appointments_status_enum" NOT NULL DEFAULT 'SCHEDULED',
  "convertedTaskId" uuid REFERENCES "tasks"("id") ON DELETE SET NULL,
  "convertedAt" timestamptz,
  "convertedByUserId" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "createdAt" timestamptz NOT NULL DEFAULT now(),
  "updatedAt" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_appointments_consultant"
  ON "appointments" ("consultantId");

CREATE INDEX IF NOT EXISTS "IDX_appointments_client_business"
  ON "appointments" ("clientBusinessId");

CREATE INDEX IF NOT EXISTS "IDX_appointments_scheduled_at"
  ON "appointments" ("scheduledAt");

CREATE INDEX IF NOT EXISTS "IDX_appointments_status"
  ON "appointments" ("status");

COMMIT;
