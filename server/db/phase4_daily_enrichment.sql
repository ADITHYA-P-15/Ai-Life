-- =============================================================
-- Phase 4 migration: optional daily enrichment fields
-- Safe to run against an existing local database.
-- =============================================================

ALTER TABLE daily_logs
    ADD COLUMN IF NOT EXISTS mood_tags JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS micro_win BOOLEAN DEFAULT false;
