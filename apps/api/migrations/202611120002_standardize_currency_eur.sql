-- 247GBS fixed-price work is denominated in EUR. New task/wallet rows must not
-- silently fall back to the legacy USD/GBP defaults.
-- Historical rows are intentionally left untouched: rewriting settled amounts
-- would misrepresent money that has already been reported to affiliates.
BEGIN;

ALTER TABLE "tasks" ALTER COLUMN "currency" SET DEFAULT 'EUR';
ALTER TABLE "tasks" ALTER COLUMN "compensationCurrency" SET DEFAULT 'EUR';
ALTER TABLE "tasks" ALTER COLUMN "businessChargeCurrency" SET DEFAULT 'EUR';
ALTER TABLE "wallets" ALTER COLUMN "currency" SET DEFAULT 'EUR';

COMMIT;
