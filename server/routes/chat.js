/**
 * chat.js - Aura chatbot route backed by Groq when configured.
 *
 * POST /api/chat - Friendly life-dashboard conversation
 */
/* global process */

import { Router } from 'express';

const router = Router();
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

function getExpenseTotal(log) {
  return (log?.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function getHobbyMinutes(log) {
  return Object.values(log?.hobbies || {}).reduce((sum, minutes) => sum + Number(minutes || 0), 0);
}

function summarizeState({ todayLog, history = [], habits = [], hobbies = [], settings = {} }) {
  const logMap = new Map();
  for (const log of history) {
    if (log?.date && log.hasLog) logMap.set(log.date, log);
  }
  if (todayLog?.date && todayLog.hasLog) logMap.set(todayLog.date, todayLog);

  const recent = Array.from(logMap.values())
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 14);

  const loggedDays = recent.length;
  const avg = (values) => {
    const usable = values.filter((value) => Number.isFinite(value));
    if (usable.length === 0) return null;
    return usable.reduce((sum, value) => sum + value, 0) / usable.length;
  };

  const recentMood = recent.map((log) => Number(log?.mood?.score || 0)).filter((value) => Number.isFinite(value));
  const recentSleep = recent.map((log) => Number(log?.sleep?.hours || 0)).filter((value) => Number.isFinite(value));
  const recentSpend = recent.map((log) => getExpenseTotal(log));
  const recentHobbyMinutes = recent.map((log) => getHobbyMinutes(log));
  const habitCompletionMatrix = recent.map((log) => {
    const completed = Object.values(log?.habits || {}).filter(Boolean).length;
    return completed;
  });

  return {
    loggedDays,
    today: todayLog?.hasLog ? {
      date: todayLog.date,
      mood: todayLog.mood?.score,
      moodNote: todayLog.mood?.note,
      moodTags: todayLog.mood?.tags || [],
      microWin: todayLog.microWin,
      sleepHours: todayLog.sleep?.hours,
      sleepQuality: todayLog.sleep?.quality,
      expenses: getExpenseTotal(todayLog),
      hobbyMinutes: getHobbyMinutes(todayLog),
      completedHabits: Object.values(todayLog.habits || {}).filter(Boolean).length,
    } : null,
    averages: {
      mood: avg(recentMood),
      sleepHours: avg(recentSleep),
      dailySpend: avg(recentSpend),
      hobbyMinutes: avg(recentHobbyMinutes),
      habitCompletions: avg(habitCompletionMatrix),
    },
    activeHabits: habits.filter((habit) => habit.active !== false).map((habit) => habit.name),
    hobbies: hobbies.map((hobby) => hobby.name),
    settings: {
      dailyBudgetTarget: settings.dailyBudgetTarget,
      monthlyBudget: settings.monthlyBudget,
      hobbyTarget: settings.hobbyTarget,
    },
    recent: recent.map((log) => ({
      date: log.date,
      mood: log.mood?.score,
      sleepHours: log.sleep?.hours,
      sleepQuality: log.sleep?.quality,
      spend: getExpenseTotal(log),
      hobbyMinutes: getHobbyMinutes(log),
      completedHabits: Object.values(log?.habits || {}).filter(Boolean).length,
      note: log.mood?.note,
    })),
  };
}

function fallbackReply(summary, userText) {
  if (summary.loggedDays === 0) {
    return "Fresh slate. Tell me one tiny thing first: how did your energy feel today, low, steady, or sharp? I’ll remember it and help you spot the pattern over time.";
  }

  const text = userText.toLowerCase();
  if (text.includes('score') || text.includes('life')) {
    const mood = summary.averages.mood;
    const sleep = summary.averages.sleepHours;
    const habits = summary.averages.habitCompletions;
    return `Your current pattern points to ${mood ? `mood around ${mood.toFixed(1)}/10` : 'mood still forming'}, ${sleep ? `sleep around ${sleep.toFixed(1)}h` : 'sleep still forming'}, and ${habits != null ? `about ${habits.toFixed(0)} habit completions per logged day` : 'habit consistency still emerging'}. That is the clearest reason your score is moving the way it is.`;
  }

  if (text.includes('sleep')) {
    const sleep = summary.averages.sleepHours;
    return sleep
      ? `Your recent sleep average is ${sleep.toFixed(1)}h. That’s useful context. Want to compare it with mood or energy so we can see what shifts your recovery?`
      : "I don’t have enough sleep data yet. Add tonight’s hours and quality and I can compare it with your mood in a more helpful way.";
  }

  if (text.includes('money') || text.includes('spend') || text.includes('budget')) {
    const spend = summary.averages.dailySpend;
    return spend != null
      ? `Your recent daily spend average is about ${Math.round(spend)}. If that feels high, the next easiest move is to trim one recurring category and watch the trend for a few days.`
      : 'I do not have enough spend history yet. Add a few expenses and I can help you spot the pattern more clearly.';
  }

  if (text.includes('hobby') || text.includes('creative')) {
    const hobbyMinutes = summary.averages.hobbyMinutes;
    return hobbyMinutes != null
      ? `Your recent hobby time average is about ${Math.round(hobbyMinutes)} minutes per logged day. A small daily block is often easier to sustain than a big weekend push.`
      : 'Hobby time is still forming in your log. Add a few minutes and I can help you find a rhythm that fits you.';
  }

  if (text.includes('quest') || text.includes('habit')) {
    if (summary.activeHabits.length === 0) {
      return "Let’s make this gentle. Pick one tiny daily quest you can actually keep, like a 10-minute walk, a few pages, or a 2-minute reset.";
    }
    return `Your current quests are ${summary.activeHabits.slice(0, 3).join(', ')}. I’d protect the easiest one first so consistency starts to feel natural instead of forced.`;
  }

  if (text.includes('week') || text.includes('summary')) {
    const mood = summary.averages.mood;
    const sleep = summary.averages.sleepHours;
    return `Your week is showing ${summary.loggedDays} logged day${summary.loggedDays === 1 ? '' : 's'}, with mood around ${mood ? mood.toFixed(1) : '--'}/10 and sleep around ${sleep ? sleep.toFixed(1) : '--'}h. I can help you zoom into sleep, spending, or habits next.`;
  }

  return "I’m here with you. Share a small update, or ask me to look for a pattern. I can work with simple notes like ‘tired after lunch’ or ‘spent more than planned today’ and turn them into something useful.";
}

async function callGroq({ messages, summary }) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const response = await fetch(GROQ_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature: 0.7,
      max_tokens: 420,
      messages: [
        {
          role: 'system',
          content: `You are Aura, a warm, encouraging life-dashboard companion. Read the user's full dashboard context across mind, sleep, habits, hobbies, money, and recent daily notes. Use the data when it is meaningful, but be humble about weak signals and avoid pretending to know more than the logs show. Ask at most one supportive follow-up question. Never give medical, legal, or investment advice. Keep replies warm, concise, and grounded in their recent patterns. Dashboard summary: ${JSON.stringify(summary)}`,
        },
        ...messages.slice(-10).map((message) => ({
          role: message.role === 'ai' ? 'assistant' : 'user',
          content: String(message.text || '').slice(0, 1000),
        })),
      ],
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || `Groq request failed with status ${response.status}`);
  }

  return data?.choices?.[0]?.message?.content?.trim() || null;
}

router.post('/', async (req, res) => {
  try {
    const messages = Array.isArray(req.body.messages) ? req.body.messages : [];
    const userText = String(req.body.message || messages.at(-1)?.text || '').trim();
    if (!userText) return res.status(400).json({ error: 'Message is required.' });

    const summary = summarizeState(req.body);
    let reply = null;
    let model = DEFAULT_MODEL;

    try {
      reply = await callGroq({ messages, summary });
    } catch (err) {
      console.error('Groq chat failed:', err.message);
    }

    if (!reply) {
      reply = fallbackReply(summary, userText);
      model = process.env.GROQ_API_KEY ? `${DEFAULT_MODEL}:fallback` : 'local-fallback';
    }

    res.json({ reply, model });
  } catch (err) {
    console.error('Aura chat error:', err);
    res.status(500).json({ error: 'Failed to chat with Aura.' });
  }
});

export default router;
