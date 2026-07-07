-- =============================================================
-- Cleanup: remove old starter habits/hobbies that were auto-seeded.
-- Keeps any starter item that already has logged activity.
-- =============================================================

DELETE FROM habits h
WHERE (h.name, h.icon) IN (
    ('Exercise', '🏋️'),
    ('Reading', '📖'),
    ('Meditation', '🧘'),
    ('Drink Water', '💧'),
    ('No Junk Food', '🥗')
)
AND NOT EXISTS (
    SELECT 1
    FROM habit_completions hc
    WHERE hc.habit_id = h.id
);

DELETE FROM hobbies h
WHERE (h.name, h.icon) IN (
    ('Guitar', '🎸'),
    ('Painting', '🎨'),
    ('Coding', '💻'),
    ('Gaming', '🎮')
)
AND NOT EXISTS (
    SELECT 1
    FROM hobby_logs hl
    WHERE hl.hobby_id = h.id
);
