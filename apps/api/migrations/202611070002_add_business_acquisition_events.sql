-- Business acquisition live activity + conversion tracking.
--
-- Central Hub notifies this portal when an invited business completes signup
-- and when it pays for a membership, access pass or trial. Events are stored
-- so dashboards show history, and relayed live over SSE.
BEGIN;

ALTER TABLE "business_prospects"
  ADD COLUMN IF NOT EXISTS "convertedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "conversionType" varchar,
  ADD COLUMN IF NOT EXISTS "conversionProvider" varchar,
  ADD COLUMN IF NOT EXISTS "conversionAmount" numeric(12, 2),
  ADD COLUMN IF NOT EXISTS "conversionReference" varchar;

CREATE TABLE IF NOT EXISTS "business_acquisition_events" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "affiliateId" character varying NOT NULL,
  "prospectId" character varying,
  "centralBusinessId" character varying,
  "type" character varying NOT NULL,
  "businessName" character varying,
  "status" character varying,
  "message" text,
  "conversionType" character varying,
  "planName" character varying,
  "amount" numeric(12, 2),
  "currency" character varying,
  "provider" character varying,
  "paymentReference" character varying,
  "metadata" jsonb,
  "occurredAt" timestamptz,
  "readAt" timestamptz,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "business_acquisition_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_business_acquisition_events_affiliateId"
  ON "business_acquisition_events" ("affiliateId");
CREATE INDEX IF NOT EXISTS "IDX_business_acquisition_events_prospectId"
  ON "business_acquisition_events" ("prospectId");
CREATE INDEX IF NOT EXISTS "IDX_business_acquisition_events_centralBusinessId"
  ON "business_acquisition_events" ("centralBusinessId");
CREATE INDEX IF NOT EXISTS "IDX_business_acquisition_events_createdAt"
  ON "business_acquisition_events" ("createdAt");
CREATE INDEX IF NOT EXISTS "IDX_business_acquisition_events_affiliate_created"
  ON "business_acquisition_events" ("affiliateId", "createdAt");

COMMIT;
