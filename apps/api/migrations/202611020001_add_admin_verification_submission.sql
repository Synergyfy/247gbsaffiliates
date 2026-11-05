-- Adds private, persisted affiliate verification submissions and identity documents.
-- The API does not run migrations automatically. Apply this before deploying code
-- when DB_SYNC is false. Local development with DB_SYNC=true is updated by TypeORM.
BEGIN;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "verificationSubmission" jsonb,
  ADD COLUMN IF NOT EXISTS "verificationDocument" bytea,
  ADD COLUMN IF NOT EXISTS "verificationDocumentName" varchar,
  ADD COLUMN IF NOT EXISTS "verificationDocumentMimeType" varchar,
  ADD COLUMN IF NOT EXISTS "verificationReviewedAt" timestamptz;

ALTER TABLE "users" ALTER COLUMN "verificationStatus" SET DEFAULT 'pending';

COMMIT;
