-- Affiliate contact/territory import from Central Hub + campaign task type.
--
-- Central Hub captures the UK postcode (and optional phone) during affiliate
-- registration. The affiliate portal now stores those values on the user row so
-- onboarding does not ask for them again and the public directory can filter by
-- territory.
--
-- Idempotent: safe on top of DB_SYNC=true schemas or managed databases.
BEGIN;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "phone" character varying,
  ADD COLUMN IF NOT EXISTS "postcode" character varying,
  ADD COLUMN IF NOT EXISTS "city" character varying,
  ADD COLUMN IF NOT EXISTS "region" character varying,
  ADD COLUMN IF NOT EXISTS "country" character varying;

ALTER TYPE "tasks_type_enum" ADD VALUE IF NOT EXISTS 'campaign';

COMMIT;
