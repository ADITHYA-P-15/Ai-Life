-- =============================================================
-- LVL_UP Life Dashboard — Database Schema
-- PostgreSQL 17
-- =============================================================

-- Drop existing tables (in reverse dependency order)
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS hobby_logs CASCADE;
DROP TABLE IF EXISTS hobbies CASCADE;
DROP TABLE IF EXISTS ai_insights CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS habit_completions CASCADE;
DROP TABLE IF EXISTS habits CASCADE;
DROP TABLE IF EXISTS daily_logs CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================
-- 1. Users
-- =============================================================
CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50)  UNIQUE NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name  VARCHAR(100),
    tier          VARCHAR(20)  DEFAULT 'Starter',
    created_at    TIMESTAMP    DEFAULT NOW(),
    updated_at    TIMESTAMP    DEFAULT NOW()
);

-- =============================================================
-- 2. Audit Events (security / misuse monitoring)
-- =============================================================
CREATE TABLE audit_events (
    id             SERIAL PRIMARY KEY,
    user_id        INT REFERENCES users(id) ON DELETE SET NULL,
    action         VARCHAR(80) NOT NULL,
    details        TEXT,
    ip_address     VARCHAR(64),
    request_method VARCHAR(10),
    request_path   VARCHAR(255),
    success        BOOLEAN DEFAULT true,
    created_at     TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_events_user_created ON audit_events(user_id, created_at DESC);
CREATE INDEX idx_audit_events_action_created ON audit_events(action, created_at DESC);

-- =============================================================
-- 3. User Settings (1:1 with users)
-- =============================================================
CREATE TABLE user_settings (
    user_id           INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    monthly_budget    INT DEFAULT 30000,
    daily_budget      INT DEFAULT 1000,
    hobby_target_mins INT DEFAULT 60
);

-- =============================================================
-- 3b. Cached AI Insights (one row per user per day)
-- =============================================================
CREATE TABLE ai_insights (
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

CREATE INDEX idx_ai_insights_user_date ON ai_insights(user_id, insight_date DESC);

-- =============================================================
-- 4. Daily Logs (one row per user per day — mood + sleep)
-- =============================================================
CREATE TABLE daily_logs (
    id            SERIAL PRIMARY KEY,
    user_id       INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date      DATE NOT NULL,
    mood_score    SMALLINT CHECK (mood_score BETWEEN 1 AND 10),
    mood_note     TEXT,
    mood_tags     JSONB DEFAULT '[]'::jsonb,
    micro_win     BOOLEAN DEFAULT false,
    sleep_hours   DECIMAL(3,1) CHECK (sleep_hours BETWEEN 0 AND 24),
    sleep_quality VARCHAR(10) CHECK (sleep_quality IN ('poor','fair','good','great')),
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

CREATE INDEX idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);

-- =============================================================
-- 5. Habits (user-defined, reusable across days)
-- =============================================================
CREATE TABLE habits (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    icon       VARCHAR(10) DEFAULT '⚡',
    is_active  BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_habits_user ON habits(user_id);

-- =============================================================
-- 6. Habit Completions (many-to-many: habit × date)
-- =============================================================
CREATE TABLE habit_completions (
    id             SERIAL PRIMARY KEY,
    habit_id       INT  NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    user_id        INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    completed_date DATE NOT NULL,
    UNIQUE(habit_id, completed_date)
);

CREATE INDEX idx_habit_completions_user_date ON habit_completions(user_id, completed_date DESC);

-- =============================================================
-- 7. Expenses
-- =============================================================
CREATE TABLE expenses (
    id           SERIAL PRIMARY KEY,
    user_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expense_date DATE NOT NULL,
    amount       DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category     VARCHAR(30)   NOT NULL,
    label        VARCHAR(200),
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_expenses_user_date ON expenses(user_id, expense_date DESC);

-- =============================================================
-- 8. Hobbies (user-defined)
-- =============================================================
CREATE TABLE hobbies (
    id         SERIAL PRIMARY KEY,
    user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name       VARCHAR(100) NOT NULL,
    icon       VARCHAR(10) DEFAULT '🎨',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_hobbies_user ON hobbies(user_id);

-- =============================================================
-- 9. Hobby Time Logs
-- =============================================================
CREATE TABLE hobby_logs (
    id       SERIAL PRIMARY KEY,
    hobby_id INT  NOT NULL REFERENCES hobbies(id) ON DELETE CASCADE,
    user_id  INT  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    minutes  INT  DEFAULT 0 CHECK (minutes >= 0),
    UNIQUE(hobby_id, log_date)
);

CREATE INDEX idx_hobby_logs_user_date ON hobby_logs(user_id, log_date DESC);

-- =============================================================
-- Trigger: auto-update `updated_at` on daily_logs changes
-- =============================================================
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_daily_logs_updated
    BEFORE UPDATE ON daily_logs
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER trg_ai_insights_updated
    BEFORE UPDATE ON ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
