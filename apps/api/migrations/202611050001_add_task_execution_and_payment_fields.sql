-- Affiliate task execution, classification and payment traceability.
--
-- Adds the fields Central Hub now sends for delegated tasks:
--   * internal/external classification + project grouping
--   * agreed deliverables, materials and prerequisite dependencies
--   * compensation + business charge (with an approval gate before work starts)
--   * review/approval statuses and task settlement references
--
-- Idempotent: safe on top of DB_SYNC=true schemas or managed databases.
BEGIN;

-- Review chain status used when the Account Manager forwards work to the business.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'tasks_status_enum'
      AND e.enumlabel = 'pending_business_approval'
  ) THEN
    ALTER TYPE "tasks_status_enum" ADD VALUE 'pending_business_approval';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tasks_category_enum') THEN
    CREATE TYPE "tasks_category_enum" AS ENUM ('internal', 'external');
  END IF;
END $$;

ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "category" "tasks_category_enum" NOT NULL DEFAULT 'external',
  ADD COLUMN IF NOT EXISTS "projectId" character varying,
  ADD COLUMN IF NOT EXISTS "projectName" character varying,
  ADD COLUMN IF NOT EXISTS "deliverables" text,
  ADD COLUMN IF NOT EXISTS "materials" text,
  ADD COLUMN IF NOT EXISTS "prerequisiteExternalTaskId" character varying,
  ADD COLUMN IF NOT EXISTS "compensationModel" character varying,
  ADD COLUMN IF NOT EXISTS "compensationAmount" numeric(12,2),
  ADD COLUMN IF NOT EXISTS "compensationCurrency" character varying NOT NULL DEFAULT 'GBP',
  ADD COLUMN IF NOT EXISTS "billableToBusiness" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "businessChargeAmount" numeric(12,2),
  ADD COLUMN IF NOT EXISTS "businessChargeCurrency" character varying NOT NULL DEFAULT 'GBP',
  ADD COLUMN IF NOT EXISTS "chargeApprovalRequired" boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "chargeApprovedAt" timestamptz,
  ADD COLUMN IF NOT EXISTS "paymentStatus" character varying,
  ADD COLUMN IF NOT EXISTS "acceptedAt" timestamptz;

CREATE INDEX IF NOT EXISTS "IDX_tasks_category" ON "tasks" ("category");
CREATE INDEX IF NOT EXISTS "IDX_tasks_projectId" ON "tasks" ("projectId");
CREATE INDEX IF NOT EXISTS "IDX_tasks_prerequisiteExternalTaskId" ON "tasks" ("prerequisiteExternalTaskId");

ALTER TABLE "transactions"
  ADD COLUMN IF NOT EXISTS "reference" character varying;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_transactions_reference"
  ON "transactions" ("reference")
  WHERE "reference" IS NOT NULL;

COMMIT;
