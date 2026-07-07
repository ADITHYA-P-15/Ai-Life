/**
 * expenses.js — Expense CRUD routes.
 * 
 * GET    /api/expenses?date=YYYY-MM-DD  — List expenses for a date (or today)
 * POST   /api/expenses                   — Add an expense
 * DELETE /api/expenses/:id               — Remove an expense
 * GET    /api/expenses/summary           — Spending summary over N days
 */

import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();

// ─────────────── LIST expenses for a date ───────────────
router.get('/', async (req, res) => {
  try {
    const date = req.query.date || new Date().toISOString().split('T')[0];
    const result = await query(
      `SELECT id, expense_date, amount, category, label, created_at
       FROM expenses
       WHERE user_id = $1 AND expense_date = $2
       ORDER BY created_at`,
      [req.user.id, date]
    );

    res.json(result.rows.map(e => ({
      id: e.id,
      date: e.expense_date.toISOString().split('T')[0],
      amount: parseFloat(e.amount),
      category: e.category,
      label: e.label,
    })));
  } catch (err) {
    console.error('List expenses error:', err);
    res.status(500).json({ error: 'Failed to fetch expenses.' });
  }
});

// ─────────────── ADD expense ───────────────
router.post('/', async (req, res) => {
  try {
    const { amount, category, label, date } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required.' });
    if (!category) return res.status(400).json({ error: 'Category is required.' });

    const expenseDate = date || new Date().toISOString().split('T')[0];

    const result = await query(
      `INSERT INTO expenses (user_id, expense_date, amount, category, label)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, expense_date, amount, category, label, created_at`,
      [req.user.id, expenseDate, amount, category, label || null]
    );

    const e = result.rows[0];
    res.status(201).json({
      id: e.id,
      date: e.expense_date.toISOString().split('T')[0],
      amount: parseFloat(e.amount),
      category: e.category,
      label: e.label,
    });
  } catch (err) {
    console.error('Add expense error:', err);
    res.status(500).json({ error: 'Failed to add expense.' });
  }
});

// ─────────────── DELETE expense ───────────────
router.delete('/:id', async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Expense not found.' });
    }
    res.json({ message: 'Expense deleted.' });
  } catch (err) {
    console.error('Delete expense error:', err);
    res.status(500).json({ error: 'Failed to delete expense.' });
  }
});

// ─────────────── SPENDING SUMMARY ───────────────
router.get('/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;

    // Total by category
    const categoryResult = await query(
      `SELECT category, SUM(amount) as total, COUNT(*) as count
       FROM expenses
       WHERE user_id = $1 AND expense_date >= CURRENT_DATE - $2::int
       GROUP BY category
       ORDER BY total DESC`,
      [req.user.id, days]
    );

    // Daily totals
    const dailyResult = await query(
      `SELECT expense_date, SUM(amount) as total
       FROM expenses
       WHERE user_id = $1 AND expense_date >= CURRENT_DATE - $2::int
       GROUP BY expense_date
       ORDER BY expense_date`,
      [req.user.id, days]
    );

    const totalSpent = categoryResult.rows.reduce((sum, r) => sum + parseFloat(r.total), 0);

    res.json({
      period: `${days} days`,
      totalSpent,
      avgDaily: days > 0 ? Math.round(totalSpent / days) : 0,
      byCategory: categoryResult.rows.map(r => ({
        category: r.category,
        total: parseFloat(r.total),
        count: parseInt(r.count),
      })),
      dailyTotals: dailyResult.rows.map(r => ({
        date: r.expense_date.toISOString().split('T')[0],
        total: parseFloat(r.total),
      })),
    });
  } catch (err) {
    console.error('Expense summary error:', err);
    res.status(500).json({ error: 'Failed to compute summary.' });
  }
});

export default router;
