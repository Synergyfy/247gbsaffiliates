-- Stores the external destination affiliates should use when completing a task.
BEGIN;

ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "executionUrl" character varying;

COMMIT;
