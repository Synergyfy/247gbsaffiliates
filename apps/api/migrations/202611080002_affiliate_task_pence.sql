-- Affiliate task money is stored as integer pence. The UI formats pounds.
BEGIN;

ALTER TABLE "tasks"
  ADD COLUMN IF NOT EXISTS "compensationPence" integer,
  ADD COLUMN IF NOT EXISTS "businessChargePence" integer;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'compensationAmount'
  ) THEN
    EXECUTE '
      UPDATE "tasks"
      SET "compensationPence" = ROUND("compensationAmount" * 100)::integer
      WHERE "compensationAmount" IS NOT NULL
        AND "compensationPence" IS NULL
    ';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'businessChargeAmount'
  ) THEN
    EXECUTE '
      UPDATE "tasks"
      SET "businessChargePence" = ROUND("businessChargeAmount" * 100)::integer
      WHERE "businessChargeAmount" IS NOT NULL
        AND "businessChargePence" IS NULL
    ';
  END IF;
END $$;

ALTER TABLE "tasks"
  DROP COLUMN IF EXISTS "compensationAmount",
  DROP COLUMN IF EXISTS "businessChargeAmount";

COMMIT;
