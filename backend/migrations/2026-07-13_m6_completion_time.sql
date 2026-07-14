-- Adds a completed_at timestamp to completions (previously date-only).
-- Run manually via Supabase Dashboard > SQL Editor before deploying code that
-- depends on this column. Additive, idempotent (safe to re-run). No Alembic
-- in this project -- this is the migration record.
--
-- Existing rows backfill to this migration's run time, not their real
-- completion time (that data was never captured) -- an accepted
-- approximation per project-brief.md.

ALTER TABLE completions ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NOT NULL DEFAULT now();
