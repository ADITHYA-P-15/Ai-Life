-- =============================================================
-- Phase 2 migration: cached AI insights
-- Safe to run against an existing local database.
-- =============================================================

CREATE TABLE IF NOT EXISTS ai_insights (
    id             SERIAL PRIMARY KEY,
    user_id        INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    insight_date   DATE NOT NULL,
    content        JSONB NOT NULL,
    model          VARCHAR(100),
    prompt_version VARCHAR(20) DEFAULT 'v1',
    generated_at   TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, insight_date)
);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_date
    ON ai_insights(user_id, insight_date DESC);

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_trigger
        WHERE tgname = 'trg_ai_insights_updated'
    ) THEN
        CREATE TRIGGER trg_ai_insights_updated
            BEFORE UPDATE ON ai_insights
            FOR EACH ROW EXECUTE FUNCTION update_timestamp();
    END IF;
END;
$$;
