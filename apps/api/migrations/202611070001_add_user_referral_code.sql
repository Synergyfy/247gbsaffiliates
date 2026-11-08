-- Referral programme: store the affiliate's Central Hub referral code/link
-- so the portal can display and share it directly.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_code" varchar;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "referral_link" text;
