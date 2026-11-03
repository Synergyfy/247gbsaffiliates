-- Persist per-affiliate progress through published Learning Hub resources.
BEGIN;

CREATE TABLE IF NOT EXISTS "learning_progress" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "resource_id" uuid NOT NULL REFERENCES "learning_resources"("id") ON DELETE CASCADE,
  "status" varchar(20) NOT NULL DEFAULT 'in_progress',
  "completed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "UQ_learning_progress_user_resource" UNIQUE ("user_id", "resource_id"),
  CONSTRAINT "CHK_learning_progress_status" CHECK ("status" IN ('in_progress', 'completed'))
);

CREATE INDEX IF NOT EXISTS "IDX_learning_progress_user_status"
  ON "learning_progress" ("user_id", "status");

COMMIT;
