-- Business acquisition, prospect tracking and permanent CHS attribution.
--
-- Adds the affiliate portal's local working records plus the relationship
-- history trail. Idempotent so it can be applied alongside DB_SYNC=true.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_prospect_status_enum') THEN
    CREATE TYPE "business_prospect_status_enum" AS ENUM (
      'identified', 'approached', 'interested', 'invitation_sent',
      'registration_started', 'registered', 'onboarding_completed',
      'verified', 'active', 'inactive', 'rejected'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_prospect_acquisition_status_enum') THEN
    CREATE TYPE "business_prospect_acquisition_status_enum" AS ENUM (
      'unverified', 'pending_verification', 'verified', 'rejected'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_relationship_type_enum') THEN
    CREATE TYPE "business_relationship_type_enum" AS ENUM (
      'acquisition', 'onboarding_assistance', 'account_management',
      'consultant_assignment', 'task_assignment', 'attribution_change',
      'status_change'
    );
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "business_prospects" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "affiliateId" character varying NOT NULL,
  "affiliateEmail" character varying,
  "affiliateName" character varying,
  "affiliateRole" character varying,
  "businessName" character varying NOT NULL,
  "contactName" character varying,
  "phone" character varying,
  "email" character varying,
  "postcode" character varying,
  "address" text,
  "category" character varying,
  "contactDate" date,
  "status" "business_prospect_status_enum" NOT NULL DEFAULT 'identified',
  "notes" text,
  "source" character varying NOT NULL DEFAULT 'affiliate_outreach',
  "invitationToken" character varying,
  "invitationUrl" text,
  "invitationSentAt" timestamptz,
  "centralBusinessId" character varying,
  "centralUserId" character varying,
  "centralClaimId" character varying,
  "acquisitionStatus" "business_prospect_acquisition_status_enum" NOT NULL DEFAULT 'unverified',
  "claimEvidence" text,
  "verifiedAt" timestamptz,
  "verifiedBy" character varying,
  "duplicateFlag" boolean NOT NULL DEFAULT false,
  "duplicateOfProspectId" character varying,
  "metadata" jsonb,
  "lastSyncedAt" timestamptz,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "business_prospects_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "IDX_business_prospects_invitationToken"
  ON "business_prospects" ("invitationToken")
  WHERE "invitationToken" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "IDX_business_prospects_affiliateId" ON "business_prospects" ("affiliateId");
CREATE INDEX IF NOT EXISTS "IDX_business_prospects_phone" ON "business_prospects" ("phone");
CREATE INDEX IF NOT EXISTS "IDX_business_prospects_email" ON "business_prospects" ("email");
CREATE INDEX IF NOT EXISTS "IDX_business_prospects_status" ON "business_prospects" ("status");
CREATE INDEX IF NOT EXISTS "IDX_business_prospects_acquisitionStatus" ON "business_prospects" ("acquisitionStatus");
CREATE INDEX IF NOT EXISTS "IDX_business_prospects_centralBusinessId" ON "business_prospects" ("centralBusinessId");

CREATE TABLE IF NOT EXISTS "business_relationship_history" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "prospectId" character varying,
  "centralBusinessId" character varying,
  "relationshipType" "business_relationship_type_enum" NOT NULL,
  "affiliateId" character varying,
  "actorId" character varying,
  "previousValue" text,
  "newValue" text,
  "metadata" jsonb,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "business_relationship_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "IDX_business_relationship_history_prospectId" ON "business_relationship_history" ("prospectId");
CREATE INDEX IF NOT EXISTS "IDX_business_relationship_history_centralBusinessId" ON "business_relationship_history" ("centralBusinessId");
CREATE INDEX IF NOT EXISTS "IDX_business_relationship_history_affiliateId" ON "business_relationship_history" ("affiliateId");

CREATE TABLE IF NOT EXISTS "business_acquisition_settings" (
  "id" integer NOT NULL DEFAULT 1,
  "targetCount" integer NOT NULL DEFAULT 20,
  "dueDate" date,
  "appliesToRoles" text,
  "requireVerification" boolean NOT NULL DEFAULT true,
  "updatedBy" character varying,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "business_acquisition_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "business_acquisition_settings" ("id", "targetCount", "appliesToRoles", "requireVerification")
VALUES (1, 20, 'agent,account_manager,consultant', true)
ON CONFLICT ("id") DO NOTHING;

COMMIT;
