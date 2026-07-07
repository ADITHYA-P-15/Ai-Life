/**
 * hobbies.js — Hobby CRUD + time logging routes.
 * 
 * GET    /api/hobbies                 — List user's hobbies
 * POST   /api/hobbies                 — Create a new hobby
 * DELETE /api/hobbies/:id             — Remove a hobby
 * PUT    /api/hobbies/:id/time/:date  — Set hobby time for a date
 * GET    /api/hobbies/logs            — Get hobby time history
 */

import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// ─────────────── LIST hobbies ───────────────
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT id, name, icon, created_at FROM hobbies WHERE user_id = $1 ORDER BY created_at',
      [req.user.id]
    );

    res.json(result.rows.map(h => ({
      id: h.id,
      name: h.name,
      icon: h.icon,
      createdAt: h.created_at,
    })));
  } catch (err) {
    console.error('List hobbies error:', err);
    res.status(500).json({ error: 'Failed to fetch hobbies.' });
  }
});

// ─────────────── CREATE hobby ───────────────
router.post('/', async (req, res) => {
  try {
    const { name, icon } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });

    const result = await query(
      'INSERT INTO hobbies (user_id, name, icon) VALUES ($1, $2, $3) RETURNING id, name, icon, created_at',
      [req.user.id, name, icon || '🎨']
    );

    const h = result.rows[0];
    res.status(201).json({
      id: h.id, name: h.name, icon: h.icon, createdAt: h.created_at,
    });
  } catch (err) {
    console.error('Create hobby error:', err);
    res.status(500).json({ error: 'Failed to create hobby.' });
  }
});

// ─────────────── DELETE hobby ───────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM hobbies WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Hobby not found.' });
    }
    res.json({ message: 'Hobby deleted.' });
  } catch (err) {
    console.error('Delete hobby error:', err);
    res.status(500).json({ error: 'Failed to delete hobby.' });
  }
});

// ─────────────── SET hobby time for a date ───────────────
router.put('/:id/time/:date', async (req, res) => {
  try {
    const { id, date } = req.params;
    const { minutes } = req.body;

    // Verify hobby belongs to user
    const hobbyCheck = await query('SELECT id FROM hobbies WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (hobbyCheck.rows.length === 0) return res.status(404).json({ error: 'Hobby not found.' });

    if (minutes === 0) {
      // Delete the log entry if setting to 0
      await query(
        'DELETE FROM hobby_logs WHERE hobby_id = $1 AND user_id = $2 AND log_date = $3',
        [id, req.user.id, date]
      );
      return res.json({ hobbyId: parseInt(id), date, minutes: 0 });
    }

    const result = await query(
      `INSERT INTO hobby_logs (hobby_id, user_id, log_date, minutes)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (hobby_id, log_date)
       DO UPDATE SET minutes = $4
       RETURNING minutes`,
      [id, req.user.id, date, minutes]
    );

    res.json({
      hobbyId: parseInt(id),
      date,
      minutes: result.rows[0].minutes,
    });
  } catch (err) {
    console.error('Set hobby time error:', err);
    res.status(500).json({ error: 'Failed to set hobby time.' });
  }
});

// ─────────────── GET hobby time history ───────────────
router.get('/logs', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const result = await query(
      `SELECT hl.hobby_id, hl.log_date, hl.minutes, h.name, h.icon
       FROM hobby_logs hl
       JOIN hobbies h ON hl.hobby_id = h.id
       WHERE hl.user_id = $1 AND hl.log_date >= CURRENT_DATE - $2::int
       ORDER BY hl.log_date DESC`,
      [req.user.id, days]
    );

    res.json(result.rows.map(r => ({
      hobbyId: r.hobby_id,
      date: r.log_date.toISOString().split('T')[0],
      minutes: r.minutes,
      hobbyName: r.name,
      hobbyIcon: r.icon,
    })));
  } catch (err) {
    console.error('Get hobby logs error:', err);
    res.status(500).json({ error: 'Failed to fetch hobby logs.' });
  }
});

export default router;
