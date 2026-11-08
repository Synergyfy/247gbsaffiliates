-- Reason an affiliate gives when declining an assigned task.
-- Shown to the business and administrators so the task can be reassigned.
BEGIN;

ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "declineReason" text;

COMMIT;
