-- Affiliate SSO schema cleanup.
--
-- Affiliates (agents, account managers, consultants) do not have platform
-- memberships. Only the business side owns membership/plan state. The portal
-- therefore keeps the Central SSO identity link and access flag, but no
-- membership metadata columns.
--
-- mcom_user_id is required for SSO, wallet, messaging and task delegation, so
-- this migration also guarantees it exists on databases provisioned with
-- DB_SYNC=false.
--
-- Idempotent: safe to run on databases that already have/lack these columns.
BEGIN;

ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "mcom_user_id" varchar,
  ADD COLUMN IF NOT EXISTS "mcom_can_access_vcard" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "mcom_access_token" text,
  ADD COLUMN IF NOT EXISTS "mcom_refresh_token" text,
  ADD COLUMN IF NOT EXISTS "mcom_token_expires_at" timestamptz,
  ADD COLUMN IF NOT EXISTS "mcom_tokens_updated_at" timestamptz;

ALTER TABLE "users"
  DROP COLUMN IF EXISTS "mcom_membership_level",
  DROP COLUMN IF EXISTS "mcom_membership_tier",
  DROP COLUMN IF EXISTS "mcom_membership_status";

CREATE INDEX IF NOT EXISTS "IDX_users_mcom_user_id"
  ON "users" ("mcom_user_id");

COMMIT;
