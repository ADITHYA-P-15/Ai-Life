/**
 * insights.js - Cached server-side AI insight generation.
 *
 * GET  /api/insights/:date - Return cached insights for a date
 * POST /api/insights       - Generate or return cached insights
 */
/* global process */

import { Router } from 'express';
import { query } from '../config/db.js';

const router = Router();
const PROMPT_VERSION = 'v1';
const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL || process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

function isValidDate(date) {
  return /^\d{4}-\d{2}-\d{2}$/.test(date || '');
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function normalizeInsights(value) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}

async function getCachedInsight(userId, date) {
  const result = await query(
    `SELECT content, model, generated_at
     FROM ai_insights
     WHERE user_id = $1 AND insight_date = $2`,
    [userId, date]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    insights: normalizeInsights(row.content),
    model: row.model,
    generatedAt: row.generated_at,
  };
}

async function saveInsight(userId, date, insights, model) {
  const result = await query(
    `INSERT INTO ai_insights (user_id, insight_date, content, model, prompt_version)
     VALUES ($1, $2, $3::jsonb, $4, $5)
     ON CONFLICT (user_id, insight_date)
     DO UPDATE SET
       content = $3::jsonb,
       model = $4,
       prompt_version = $5,
       generated_at = NOW()
     RETURNING content, model, generated_at`,
    [userId, date, JSON.stringify(insights), model, PROMPT_VERSION]
  );

  const row = result.rows[0];
  return {
    insights: normalizeInsights(row.content),
    model: row.model,
    generatedAt: row.generated_at,
  };
}

function summarizeLogs(history = [], todayLog) {
  const logMap = new Map();
  for (const log of history || []) {
    if (log?.date) logMap.set(log.date, log);
  }
  if (todayLog?.date) logMap.set(todayLog.date, todayLog);

  return Array.from(logMap.values())
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 14)
    .map((log) => {
      const expenseTotal = (log.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      const habitCount = Object.values(log.habits || {}).filter(Boolean).length;
      const hobbyMinutes = Object.values(log.hobbies || {}).reduce((sum, minutes) => sum + Number(minutes || 0), 0);

      return {
        date: log.date,
        moodScore: log.mood?.score ?? null,
        moodNote: log.mood?.note || '',
        sleepHours: log.sleep?.hours ?? null,
        sleepQuality: log.sleep?.quality || null,
        completedHabits: habitCount,
        totalSpending: expenseTotal,
        hobbyMinutes,
      };
    });
}

function buildPrompt({ todayLog, history, habits, hobbies, settings }) {
  const payload = {
    recentLogs: summarizeLogs(history, todayLog),
    habits: (habits || []).map((habit) => ({
      id: habit.id,
      name: habit.name,
      active: habit.active !== false,
    })),
    hobbies: (hobbies || []).map((hobby) => ({
      id: hobby.id,
      name: hobby.name,
    })),
    settings: {
      dailyBudgetTarget: settings?.dailyBudgetTarget,
      monthlyBudget: settings?.monthlyBudget,
      hobbyTarget: settings?.hobbyTarget,
    },
  };

  return `Analyze this personal life-dashboard data and return only valid JSON in the form {"insights":["...", "..."]}.
Create 2 to 4 concise insights. Prefer cross-domain patterns across mood, sleep, habits, spending, and hobbies. Be specific when the data supports it, and avoid medical or financial advice. Data:
${JSON.stringify(payload, null, 2)}`;
}

function parseInsightText(text) {
  if (!text) return [];

  const cleaned = text
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return normalizeInsights(parsed.insights || parsed);
  } catch {
    return cleaned
      .split('\n')
      .map((line) => line.replace(/^[-*\d.\s]+/, '').trim())
      .filter(Boolean)
      .slice(0, 4);
  }
}

function generateFallbackInsights({ todayLog, history, habits, hobbies, settings }) {
  const logs = summarizeLogs(history, todayLog);

  if (logs.length < 2) {
    return [
      "Keep logging for a few more days so Aura can spot patterns across sleep, mood, habits, spending, and hobbies.",
      "Today's ritual is enough for now: mood, sleep, one habit signal, and one money or hobby note will make future insights sharper.",
    ];
  }

  const moodLogs = logs.filter((log) => typeof log.moodScore === 'number');
  const avgMood = moodLogs.reduce((sum, log) => sum + log.moodScore, 0) / Math.max(moodLogs.length, 1);
  const avgSleep = logs.reduce((sum, log) => sum + Number(log.sleepHours || 0), 0) / logs.length;
  const avgSpend = logs.reduce((sum, log) => sum + Number(log.totalSpending || 0), 0) / logs.length;
  const avgHobby = logs.reduce((sum, log) => sum + Number(log.hobbyMinutes || 0), 0) / logs.length;
  const activeHabits = (habits || []).filter((habit) => habit.active !== false).length;
  const hobbyCount = (hobbies || []).length;
  const insights = [];

  insights.push(`Your recent mood average is ${avgMood.toFixed(1)}/10 across ${moodLogs.length} logged day${moodLogs.length === 1 ? '' : 's'}. Watch what changes on days above and below that baseline.`);

  if (avgSleep < 6.5) {
    insights.push(`Sleep is the first lever to inspect: your recent average is ${avgSleep.toFixed(1)} hours, below the 7 hour mark most people use as a recovery floor.`);
  } else {
    insights.push(`Your sleep average is ${avgSleep.toFixed(1)} hours, which gives the rest of your dashboard a steadier base to work from.`);
  }

  if (settings?.dailyBudgetTarget && avgSpend > settings.dailyBudgetTarget) {
    insights.push(`Recent spending is averaging Rs ${Math.round(avgSpend)} per logged day, above your Rs ${settings.dailyBudgetTarget} daily target. Look for the category driving that gap.`);
  } else if (settings?.dailyBudgetTarget) {
    insights.push(`Recent spending is averaging Rs ${Math.round(avgSpend)} per logged day against your Rs ${settings.dailyBudgetTarget} target, so your budget rhythm is currently controlled.`);
  }

  if (hobbyCount > 0 && avgHobby > 0) {
    insights.push(`You are averaging ${Math.round(avgHobby)} hobby minutes per logged day. Keeping even a small creative block makes this system feel less like tracking and more like fuel.`);
  } else if (activeHabits > 0) {
    insights.push(`You have ${activeHabits} active habit${activeHabits === 1 ? '' : 's'} in play. The next useful pattern is whether completed-habit days line up with better mood or sleep.`);
  }

  return insights.slice(0, 4);
}

async function callAnthropic(prompt) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': process.env.ANTHROPIC_VERSION || '2023-06-01',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      max_tokens: 700,
      temperature: 0.4,
      system: 'You are Aura, a concise personal dashboard analyst. Return only JSON.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data?.error?.message || `Anthropic request failed with status ${response.status}`;
    throw new Error(message);
  }

  const text = (data.content || [])
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('\n');

  return parseInsightText(text);
}

router.get('/:date', async (req, res) => {
  try {
    const { date } = req.params;
    if (!isValidDate(date)) return res.status(400).json({ error: 'Valid date is required.' });

    const cached = await getCachedInsight(req.user.id, date);
    if (!cached) return res.json({ insights: [], cached: false });

    res.json({ ...cached, cached: true });
  } catch (err) {
    console.error('Get cached insight error:', err);
    res.status(500).json({ error: 'Failed to fetch cached insights.' });
  }
});

router.post('/', async (req, res) => {
  try {
    const date = req.body.date || req.body.todayLog?.date || todayISO();
    const regenerate = Boolean(req.body.regenerate);

    if (!isValidDate(date)) return res.status(400).json({ error: 'Valid date is required.' });

    if (!regenerate) {
      const cached = await getCachedInsight(req.user.id, date);
      if (cached?.insights.length > 0) {
        return res.json({ ...cached, cached: true });
      }
    }

    const prompt = buildPrompt(req.body);
    let insights = [];
    let model = DEFAULT_MODEL;

    try {
      insights = await callAnthropic(prompt);
    } catch (err) {
      console.error('Anthropic insight generation failed:', err.message);
    }

    if (!insights || insights.length === 0) {
      insights = generateFallbackInsights(req.body);
      model = process.env.ANTHROPIC_API_KEY ? `${DEFAULT_MODEL}:fallback` : 'local-fallback';
    }

    const saved = await saveInsight(req.user.id, date, insights, model);
    res.json({ ...saved, cached: false });
  } catch (err) {
    console.error('Generate insight error:', err);
    res.status(500).json({ error: 'Failed to generate insights.' });
  }
});

export default router;
