/**
 * dailyLogs.js — Daily log routes (mood + sleep per date).
 * 
 * GET  /api/logs/:date         — Get log for a specific date
 * PUT  /api/logs/:date         — Upsert mood + sleep for a date
 * DELETE /api/logs/:date       — Clear all tracked data for a date
 * GET  /api/logs/history?days= — Get last N days of logs
 * GET  /api/score/:date        — Compute Life Score for a date
 */

import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// ─────────────── GET log for a specific date ───────────────
router.get('/logs/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    // Get base log (mood + sleep)
    const logResult = await query(
      'SELECT * FROM daily_logs WHERE user_id = $1 AND log_date = $2',
      [userId, date]
    );

    // Get habit completions for this date
    const habitsResult = await query(
      `SELECT hc.habit_id, h.name, h.icon
       FROM habit_completions hc
       JOIN habits h ON hc.habit_id = h.id
       WHERE hc.user_id = $1 AND hc.completed_date = $2`,
      [userId, date]
    );

    // Get expenses for this date
    const expensesResult = await query(
      'SELECT id, amount, category, label, created_at FROM expenses WHERE user_id = $1 AND expense_date = $2 ORDER BY created_at',
      [userId, date]
    );

    // Get hobby logs for this date
    const hobbiesResult = await query(
      `SELECT hl.hobby_id, hl.minutes, h.name, h.icon
       FROM hobby_logs hl
       JOIN hobbies h ON hl.hobby_id = h.id
       WHERE hl.user_id = $1 AND hl.log_date = $2`,
      [userId, date]
    );

    const log = logResult.rows[0] || {};
    const hasLog = Boolean(logResult.rows[0]);

    // Build habit completions map: { habitId: true }
    const habitCompletions = {};
    habitsResult.rows.forEach(row => {
      habitCompletions[row.habit_id] = true;
    });

    // Build hobby times map: { hobbyId: minutes }
    const hobbyTimes = {};
    hobbiesResult.rows.forEach(row => {
      hobbyTimes[row.hobby_id] = row.minutes;
    });

    res.json({
      date,
      hasLog,
      mood: {
        score: hasLog ? log.mood_score : 0,
        note: log.mood_note || '',
        tags: Array.isArray(log.mood_tags) ? log.mood_tags : [],
      },
      microWin: Boolean(log.micro_win),
      sleep: {
        hours: hasLog ? parseFloat(log.sleep_hours) : 0,
        quality: hasLog ? log.sleep_quality || '' : '',
      },
      habits: habitCompletions,
      expenses: expensesResult.rows.map(e => ({
        id: e.id,
        amount: parseFloat(e.amount),
        category: e.category,
        label: e.label,
      })),
      hobbies: hobbyTimes,
    });
  } catch (err) {
    console.error('Get log error:', err);
    res.status(500).json({ error: 'Failed to fetch daily log.' });
  }
});

// ─────────────── GET history (last N days) ───────────────
router.get('/logs', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const userId = req.user.id;

    const result = await query(
      `SELECT log_date, mood_score, mood_note, mood_tags, micro_win, sleep_hours, sleep_quality
       FROM daily_logs
       WHERE user_id = $1 AND log_date >= CURRENT_DATE - $2::int
       ORDER BY log_date DESC`,
      [userId, days]
    );

    // For each date, also get habit completions, expenses, hobbies
    const logs = [];
    for (const row of result.rows) {
      const dateStr = row.log_date.toISOString().split('T')[0];

      const [habitsRes, expensesRes, hobbiesRes] = await Promise.all([
        query(
          'SELECT habit_id FROM habit_completions WHERE user_id = $1 AND completed_date = $2',
          [userId, dateStr]
        ),
        query(
          'SELECT id, amount, category, label FROM expenses WHERE user_id = $1 AND expense_date = $2',
          [userId, dateStr]
        ),
        query(
          'SELECT hobby_id, minutes FROM hobby_logs WHERE user_id = $1 AND log_date = $2',
          [userId, dateStr]
        ),
      ]);

      const habitCompletions = {};
      habitsRes.rows.forEach(r => { habitCompletions[r.habit_id] = true; });

      const hobbyTimes = {};
      hobbiesRes.rows.forEach(r => { hobbyTimes[r.hobby_id] = r.minutes; });

      logs.push({
        date: dateStr,
        hasLog: true,
        mood: { score: row.mood_score, note: row.mood_note || '', tags: Array.isArray(row.mood_tags) ? row.mood_tags : [] },
        microWin: Boolean(row.micro_win),
        sleep: { hours: parseFloat(row.sleep_hours), quality: row.sleep_quality },
        habits: habitCompletions,
        expenses: expensesRes.rows.map(e => ({
          id: e.id, amount: parseFloat(e.amount), category: e.category, label: e.label,
        })),
        hobbies: hobbyTimes,
      });
    }

    res.json(logs);
  } catch (err) {
    console.error('Get history error:', err);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
});

// ─────────────── PUT (upsert) mood + sleep for a date ───────────────
router.put('/logs/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;
    const { mood, sleep, microWin } = req.body;

    const result = await query(
      `INSERT INTO daily_logs (user_id, log_date, mood_score, mood_note, mood_tags, micro_win, sleep_hours, sleep_quality)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
       ON CONFLICT (user_id, log_date)
       DO UPDATE SET
         mood_score    = COALESCE($3, daily_logs.mood_score),
         mood_note     = COALESCE($4, daily_logs.mood_note),
         mood_tags     = COALESCE($5::jsonb, daily_logs.mood_tags),
         micro_win     = COALESCE($6, daily_logs.micro_win),
         sleep_hours   = COALESCE($7, daily_logs.sleep_hours),
         sleep_quality = COALESCE($8, daily_logs.sleep_quality)
       RETURNING *`,
      [
        userId,
        date,
        mood?.score || null,
        mood?.note ?? null,
        JSON.stringify(Array.isArray(mood?.tags) ? mood.tags : []),
        typeof microWin === 'boolean' ? microWin : null,
        sleep?.hours ?? null,
        sleep?.quality || null,
      ]
    );

    res.json({
      date,
      hasLog: true,
      mood: {
        score: result.rows[0].mood_score,
        note: result.rows[0].mood_note || '',
        tags: Array.isArray(result.rows[0].mood_tags) ? result.rows[0].mood_tags : [],
      },
      microWin: Boolean(result.rows[0].micro_win),
      sleep: {
        hours: parseFloat(result.rows[0].sleep_hours),
        quality: result.rows[0].sleep_quality,
      },
    });
  } catch (err) {
    console.error('Put log error:', err);
    res.status(500).json({ error: 'Failed to save daily log.' });
  }
});

// ─────────────── DELETE all tracked data for a date ───────────────
router.delete('/logs/:date', async (req, res) => {
  try {
    const { date } = req.params;
    const userId = req.user.id;

    await query('DELETE FROM habit_completions WHERE user_id = $1 AND completed_date = $2', [userId, date]);
    await query('DELETE FROM expenses WHERE user_id = $1 AND expense_date = $2', [userId, date]);
    await query('DELETE FROM hobby_logs WHERE user_id = $1 AND log_date = $2', [userId, date]);
    await query('DELETE FROM ai_insights WHERE user_id = $1 AND insight_date = $2', [userId, date]);
    await query('DELETE FROM daily_logs WHERE user_id = $1 AND log_date = $2', [userId, date]);

    res.json({ date, cleared: true });
  } catch (err) {
    console.error('Clear log error:', err);
    res.status(500).json({ error: 'Failed to clear daily log.' });
  }
});

export default router;
