-- Add the consultancy task type used by consultant sessions.
-- Keep this idempotent so it can be re-run safely alongside DB_SYNC=true.
BEGIN;

ALTER TYPE "tasks_type_enum" ADD VALUE IF NOT EXISTS 'consultancy';

COMMIT;
