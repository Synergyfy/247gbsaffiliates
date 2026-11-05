-- Standalone assessments are immutable snapshots of existing question-bank items.
-- They are independent from onboarding quiz attempts and qualification flags.
BEGIN;

CREATE TABLE IF NOT EXISTS "assessment_assignments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "assigned_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "title" varchar(160) NOT NULL,
  "instructions" text,
  "due_at" timestamptz,
  "question_snapshot" jsonb NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'assigned',
  "answers" jsonb,
  "score" integer,
  "max_score" integer,
  "percentage" integer,
  "submitted_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT "CHK_assessment_assignments_status" CHECK ("status" IN ('assigned', 'in_progress', 'pass', 'partial', 'fail')),
  CONSTRAINT "CHK_assessment_assignments_percentage" CHECK ("percentage" IS NULL OR ("percentage" >= 0 AND "percentage" <= 100))
);

CREATE INDEX IF NOT EXISTS "IDX_assessment_assignments_user_created"
  ON "assessment_assignments" ("user_id", "created_at" DESC);

CREATE INDEX IF NOT EXISTS "IDX_assessment_assignments_status"
  ON "assessment_assignments" ("status");

COMMIT;
