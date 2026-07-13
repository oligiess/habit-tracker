-- Milestone 3: new Habit fields (category, target, target_per_week, archived_at).
-- Run manually via Supabase Dashboard > SQL Editor BEFORE deploying the
-- Milestone 3 backend code. Additive/nullable only, idempotent (safe to
-- re-run). No Alembic in this project -- this is the migration record.

ALTER TABLE habits ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE habits ADD COLUMN IF NOT EXISTS target VARCHAR(100);
ALTER TABLE habits ADD COLUMN IF NOT EXISTS target_per_week INTEGER;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
