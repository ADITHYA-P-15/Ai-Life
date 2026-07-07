-- =============================================================
-- Seed data — inserts default habits/hobbies for a new user.
-- Called via: INSERT function in auth route after registration.
-- This file is a reference/manual seed for testing.
-- =============================================================

-- Usage: After creating a user manually, run these with the user's ID.
-- Replace $USER_ID with the actual user id.

-- Default habits
-- INSERT INTO habits (user_id, name, icon) VALUES
--   ($USER_ID, 'Exercise',     '🏋️'),
--   ($USER_ID, 'Reading',      '📖'),
--   ($USER_ID, 'Meditation',   '🧘'),
--   ($USER_ID, 'Drink Water',  '💧'),
--   ($USER_ID, 'No Junk Food', '🥗');

-- Default hobbies
-- INSERT INTO hobbies (user_id, name, icon) VALUES
--   ($USER_ID, 'Guitar',   '🎸'),
--   ($USER_ID, 'Painting', '🎨'),
--   ($USER_ID, 'Coding',   '💻'),
--   ($USER_ID, 'Gaming',   '🎮');

-- Default settings
-- INSERT INTO user_settings (user_id, monthly_budget, daily_budget, hobby_target_mins)
-- VALUES ($USER_ID, 30000, 1000, 60);
