-- Central Hub → 247GBS Affiliates delegated-task collaboration.
-- Adds the submission/review loop columns and the Central origin values.
-- Idempotent: safe to apply on top of a DB_SYNC=true schema or a managed DB.
-- Apply with DB_SYNC=false deployments before deploying this code.
BEGIN;

-- New task status used when Central admin requests changes.
ALTER TYPE "tasks_status_enum" ADD VALUE IF NOT EXISTS 'revision_requested';

-- New origin system value for Central-delegated work.
ALTER TYPE "tasks_originsystem_enum" ADD VALUE IF NOT EXISTS 'MCOM_CENTRAL';

ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "centralBusinessId" varchar,
  ADD COLUMN IF NOT EXISTS "centralBusinessName" varchar,
  ADD COLUMN IF NOT EXISTS "platforms" text,
  ADD COLUMN IF NOT EXISTS "assigneeEmail" varchar,
  ADD COLUMN IF NOT EXISTS "submissionData" jsonb,
  ADD COLUMN IF NOT EXISTS "reviewHistory" jsonb,
  ADD COLUMN IF NOT EXISTS "reviewNotes" varchar,
  ADD COLUMN IF NOT EXISTS "revisionCount" integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "submittedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "reviewedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "completedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "lastCentralSyncAt" timestamptz;

CREATE INDEX IF NOT EXISTS "IDX_tasks_externalTaskId" ON "tasks" ("externalTaskId");
CREATE INDEX IF NOT EXISTS "IDX_tasks_assigneeEmail" ON "tasks" ("assigneeEmail");

COMMIT;
