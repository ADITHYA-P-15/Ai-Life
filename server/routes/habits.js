/**
 * habits.js — Habit CRUD + completion toggle routes.
 * 
 * GET    /api/habits                      — List user's habits
 * POST   /api/habits                      — Create a new habit
 * DELETE /api/habits/:id                  — Remove a habit
 * POST   /api/habits/:id/complete/:date   — Mark habit done for a date
 * DELETE /api/habits/:id/complete/:date   — Unmark habit for a date
 * GET    /api/habits/completions          — Get completion history
 * GET    /api/habits/streaks              — Compute current streaks
 */

import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// ─────────────── LIST habits ───────────────
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, icon, is_active, created_at FROM habits WHERE user_id = $1 ORDER BY created_at',
      [req.user.id]
    );

    res.json(result.rows.map(h => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      active: h.is_active,
      createdAt: h.created_at,
    })));
  } catch (err) {
    console.error('List habits error:', err);
    res.status(500).json({ error: 'Failed to fetch habits.' });
  }
});

// ─────────────── CREATE habit ───────────────
router.post('/', async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const result = await query(
      'INSERT INTO habits (user_id, name, icon) VALUES ($1, $2, $3) RETURNING id, name, icon, is_active, created_at',
      [req.user.id, name, icon || '⚡']
    );

    const h = result.rows[0];
    res.status(201).json({
      id: h.id, name: h.name, icon: h.icon, active: h.is_active, createdAt: h.created_at,
    });
  } catch (err) {
    console.error('Create habit error:', err);
    res.status(500).json({ error: 'Failed to create habit.' });
  }
});

// ─────────────── DELETE habit ───────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM habits WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Habit not found.' });
    }
    res.json({ message: 'Habit deleted.' });
  } catch (err) {
    console.error('Delete habit error:', err);
    res.status(500).json({ error: 'Failed to delete habit.' });
  }
});

// ─────────────── COMPLETE habit for a date (toggle ON) ───────────────
router.post('/:id/complete/:date', async (req, res) => {
  try {
    const { id, date } = req.params;

    // Verify habit belongs to user
    const habitCheck = await query('SELECT id FROM habits WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (habitCheck.rows.length === 0) return res.status(404).json({ error: 'Habit not found.' });

    await query(
      `INSERT INTO habit_completions (habit_id, user_id, completed_date)
       VALUES ($1, $2, $3)
       ON CONFLICT (habit_id, completed_date) DO NOTHING`,
      [id, req.user.id, date]
    );

    res.json({ habitId: parseInt(id), date, completed: true });
  } catch (err) {
    console.error('Complete habit error:', err);
    res.status(500).json({ error: 'Failed to complete habit.' });
  }
});

// ─────────────── UNCOMPLETE habit for a date (toggle OFF) ───────────────
router.delete('/:id/complete/:date', async (req, res) => {
  try {
    const { id, date } = req.params;

    await query(
      'DELETE FROM habit_completions WHERE habit_id = $1 AND user_id = $2 AND completed_date = $3',
      [id, req.user.id, date]
    );

    res.json({ habitId: parseInt(id), date, completed: false });
  } catch (err) {
    console.error('Uncomplete habit error:', err);
    res.status(500).json({ error: 'Failed to uncomplete habit.' });
  }
});

// ─────────────── GET completions history ───────────────
router.get('/completions', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const result = await query(
      `SELECT hc.habit_id, hc.completed_date, h.name
       FROM habit_completions hc
       JOIN habits h ON hc.habit_id = h.id
       WHERE hc.user_id = $1 AND hc.completed_date >= CURRENT_DATE - $2::int
       ORDER BY hc.completed_date DESC`,
      [req.user.id, days]
    );

    res.json(result.rows.map(r => ({
      habitId: r.habit_id,
      date: r.completed_date.toISOString().split('T')[0],
      habitName: r.name,
    })));
  } catch (err) {
    console.error('Get completions error:', err);
    res.status(500).json({ error: 'Failed to fetch completions.' });
  }
});

// ─────────────── GET streaks ───────────────
router.get('/streaks', async (req, res) => {
  try {
    const habits = await query(
      'SELECT id, name FROM habits WHERE user_id = $1 AND is_active = true',
      [req.user.id]
    );

    const streaks = {};
    for (const habit of habits.rows) {
      // Get all completion dates for this habit, ordered descending
      const completions = await query(
        `SELECT completed_date FROM habit_completions
         WHERE habit_id = $1 AND user_id = $2
         ORDER BY completed_date DESC`,
        [habit.id, req.user.id]
      );

      let current = 0;
      let longest = 0;

      if (completions.rows.length > 0) {
        // Calculate current streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let checkDate = new Date(today);
        
        for (const row of completions.rows) {
          const compDate = new Date(row.completed_date);
          compDate.setHours(0, 0, 0, 0);
          
          if (compDate.getTime() === checkDate.getTime()) {
            current++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else if (compDate.getTime() === checkDate.getTime() - 86400000) {
            // Allow one day gap (yesterday check)
            current++;
            checkDate = new Date(compDate);
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }

        // Calculate longest streak (simplified: count consecutive dates)
        let tempStreak = 1;
        longest = 1;
        for (let i = 1; i < completions.rows.length; i++) {
          const prev = new Date(completions.rows[i - 1].completed_date);
          const curr = new Date(completions.rows[i].completed_date);
          const diff = (prev.getTime() - curr.getTime()) / 86400000;
          if (diff === 1) {
            tempStreak++;
            longest = Math.max(longest, tempStreak);
          } else {
            tempStreak = 1;
          }
        }
        longest = Math.max(longest, current);
      }

      streaks[habit.id] = { current, longest };
    }

    res.json(streaks);
  } catch (err) {
    console.error('Get streaks error:', err);
    res.status(500).json({ error: 'Failed to compute streaks.' });
  }
});

export default router;
