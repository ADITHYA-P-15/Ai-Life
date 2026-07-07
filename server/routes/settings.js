/**
 * settings.js — User settings routes.
 * 
 * GET /api/settings  — Get current user's settings
 * PUT /api/settings  — Update settings
 */

import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// ─────────────── GET settings ───────────────
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM user_settings WHERE user_id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Create default settings if none exist
      const insert = await query(
        `INSERT INTO user_settings (user_id) VALUES ($1)
         RETURNING monthly_budget, daily_budget, hobby_target_mins`,
        [req.user.id]
      );
      const s = insert.rows[0];
      return res.json({
        monthlyBudget: s.monthly_budget,
        dailyBudgetTarget: s.daily_budget,
        hobbyTarget: s.hobby_target_mins,
      });
    }

    const s = result.rows[0];
    res.json({
      monthlyBudget: s.monthly_budget,
      dailyBudgetTarget: s.daily_budget,
      hobbyTarget: s.hobby_target_mins,
    });
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

// ─────────────── PUT settings ───────────────
router.put('/', async (req, res) => {
  try {
    const { monthlyBudget, dailyBudgetTarget, hobbyTarget } = req.body;

    const result = await query(
      `INSERT INTO user_settings (user_id, monthly_budget, daily_budget, hobby_target_mins)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id)
       DO UPDATE SET
         monthly_budget    = COALESCE($2, user_settings.monthly_budget),
         daily_budget      = COALESCE($3, user_settings.daily_budget),
         hobby_target_mins = COALESCE($4, user_settings.hobby_target_mins)
       RETURNING monthly_budget, daily_budget, hobby_target_mins`,
      [
        req.user.id,
        monthlyBudget ?? null,
        dailyBudgetTarget ?? null,
        hobbyTarget ?? null,
      ]
    );

    const s = result.rows[0];
    res.json({
      monthlyBudget: s.monthly_budget,
      dailyBudgetTarget: s.daily_budget,
      hobbyTarget: s.hobby_target_mins,
    });
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Failed to update settings.' });
  }
});

export default router;
