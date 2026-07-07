import { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext.jsx';
import { formatShort, getLastNDays } from '../utils/dates.js';
import './TrendOverview.css';

const PERIODS = [7, 30];

const DOMAIN_LINES = [
  { key: 'mood', label: 'Mind', color: '#00e5ff' },
  { key: 'sleep', label: 'Sleep', color: '#cdc0e9' },
  { key: 'habits', label: 'Habits', color: '#10b981' },
  { key: 'money', label: 'Money', color: '#f5c84b' },
  { key: 'hobbies', label: 'Hobbies', color: '#ff7ab6' },
];

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function getExpenseTotal(log) {
  return (log?.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function getHobbyMinutes(log) {
  return Object.values(log?.hobbies || {}).reduce((sum, minutes) => sum + Number(minutes || 0), 0);
}

function pearson(pairs) {
  const usable = pairs.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y));
  if (usable.length < 4) return null;

  const xAvg = usable.reduce((sum, pair) => sum + pair[0], 0) / usable.length;
  const yAvg = usable.reduce((sum, pair) => sum + pair[1], 0) / usable.length;
  let numerator = 0;
  let xDenom = 0;
  let yDenom = 0;

  for (const [x, y] of usable) {
    const xDiff = x - xAvg;
    const yDiff = y - yAvg;
    numerator += xDiff * yDiff;
    xDenom += xDiff * xDiff;
    yDenom += yDiff * yDiff;
  }

  const denominator = Math.sqrt(xDenom * yDenom);
  if (denominator === 0) return null;
  return numerator / denominator;
}

function describeCorrelation(value) {
  if (value == null) return { label: 'Collecting', tone: 'neutral', score: '--' };
  const score = value.toFixed(2);
  if (value >= 0.45) return { label: 'Positive', tone: 'good', score };
  if (value <= -0.45) return { label: 'Inverse', tone: 'warn', score };
  return { label: 'Emerging', tone: 'neutral', score };
}

function buildReview(rows, activeHabitCount, settings) {
  const loggedRows = rows.filter((row) => row.hasLog);
  if (loggedRows.length === 0) {
    return {
      title: 'Fresh Start',
      body: 'No logs yet for this window. Your trends will build from your own daily check-ins.',
    };
  }

  const avgMood = loggedRows.reduce((sum, row) => sum + Number(row.rawMood || 0), 0) / loggedRows.length;
  const avgSleep = loggedRows.reduce((sum, row) => sum + Number(row.rawSleep || 0), 0) / loggedRows.length;
  const totalSpend = loggedRows.reduce((sum, row) => sum + row.rawSpend, 0);
  const totalHobby = loggedRows.reduce((sum, row) => sum + row.rawHobby, 0);
  const habitDays = activeHabitCount > 0
    ? loggedRows.filter((row) => row.rawHabitRate >= 0.8).length
    : 0;

  const strongest = [
    { label: 'mind', value: avgMood * 10 },
    { label: 'sleep', value: clamp((avgSleep / 8) * 100) },
    { label: 'money', value: settings.dailyBudgetTarget ? clamp(100 - ((totalSpend / loggedRows.length) / settings.dailyBudgetTarget) * 100) : 0 },
    { label: 'hobbies', value: settings.hobbyTarget ? clamp((totalHobby / loggedRows.length / settings.hobbyTarget) * 100) : 0 },
    { label: 'habits', value: activeHabitCount > 0 ? (habitDays / loggedRows.length) * 100 : 0 },
  ].sort((a, b) => b.value - a.value)[0];

  return {
    title: `${loggedRows.length} Day${loggedRows.length === 1 ? '' : 's'} Logged`,
    body: `Strongest signal: ${strongest.label}. Mood averaged ${avgMood.toFixed(1)}/10, sleep ${avgSleep.toFixed(1)}h, hobbies ${Math.round(totalHobby)}m, spending Rs ${Math.round(totalSpend)}.`,
  };
}

export default function TrendOverview() {
  const { state } = useApp();
  const [period, setPeriod] = useState(7);

  const activeHabitCount = useMemo(
    () => state.habits.filter((habit) => habit.active !== false).length,
    [state.habits]
  );

  const rows = useMemo(() => {
    const logMap = new Map();
    for (const log of state.history || []) {
      if (log.date) logMap.set(log.date, log);
    }
    if (state.todayLog?.date) logMap.set(state.todayLog.date, state.todayLog);

    return getLastNDays(period).map((date) => {
      const log = logMap.get(date);
      const mood = log?.mood?.score ?? null;
      const sleep = log?.sleep?.hours ?? null;
      const spend = getExpenseTotal(log);
      const hobbyMinutes = getHobbyMinutes(log);
      const completedHabits = Object.values(log?.habits || {}).filter(Boolean).length;
      const habitRate = activeHabitCount > 0 ? completedHabits / activeHabitCount : null;
      const dailyBudget = state.settings.dailyBudgetTarget || 1000;
      const hobbyTarget = state.settings.hobbyTarget || 60;

      return {
        date,
        label: formatShort(date),
        hasLog: Boolean(log?.hasLog),
        mood: mood == null ? null : clamp(mood * 10),
        sleep: sleep == null ? null : clamp((sleep / 8) * 100),
        habits: habitRate == null ? null : clamp(habitRate * 100),
        money: log ? clamp(100 - (spend / dailyBudget) * 100) : null,
        hobbies: log ? clamp((hobbyMinutes / hobbyTarget) * 100) : null,
        rawMood: mood,
        rawSleep: sleep,
        rawSpend: spend,
        rawHobby: hobbyMinutes,
        rawHabitRate: habitRate,
      };
    });
  }, [state.history, state.todayLog, state.settings, activeHabitCount, period]);

  const summary = useMemo(() => {
    const loggedRows = rows.filter((row) => row.hasLog);
    const avg = (key) => {
      const values = loggedRows.map((row) => row[key]).filter((value) => Number.isFinite(value));
      if (values.length === 0) return 0;
      return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    };

    return {
      loggedDays: loggedRows.length,
      mood: avg('mood'),
      sleep: avg('sleep'),
      habits: avg('habits'),
      money: avg('money'),
      hobbies: avg('hobbies'),
    };
  }, [rows]);

  const correlations = useMemo(() => {
    const loggedRows = rows.filter((row) => row.hasLog);
    return [
      {
        title: 'Sleep x Mood',
        icon: 'bedtime',
        ...describeCorrelation(pearson(loggedRows.map((row) => [row.rawSleep, row.rawMood]))),
      },
      {
        title: 'Habits x Mood',
        icon: 'task_alt',
        ...describeCorrelation(pearson(loggedRows.map((row) => [row.rawHabitRate, row.rawMood]))),
      },
      {
        title: 'Hobby x Mood',
        icon: 'palette',
        ...describeCorrelation(pearson(loggedRows.map((row) => [row.rawHobby, row.rawMood]))),
      },
      {
        title: 'Spend x Mood',
        icon: 'payments',
        ...describeCorrelation(pearson(loggedRows.map((row) => [row.rawSpend, row.rawMood]))),
      },
    ];
  }, [rows]);

  const review = useMemo(
    () => buildReview(rows, activeHabitCount, state.settings),
    [rows, activeHabitCount, state.settings]
  );

  return (
    <section className="trend-overview glass-card glass-card--no-hover">
      <div className="trend-overview__header">
        <h3 className="text-headline-md hub__section-title trend-overview__title">
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>show_chart</span>
          Trends
        </h3>
        <div className="trend-overview__periods" aria-label="Trend range">
          {PERIODS.map((days) => (
            <button
              key={days}
              type="button"
              className={`trend-overview__period ${period === days ? 'trend-overview__period--active' : ''}`}
              onClick={() => setPeriod(days)}
            >
              {days}D
            </button>
          ))}
        </div>
      </div>

      <div className="trend-overview__body">
        <div className="trend-overview__chart-wrap">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={rows} margin={{ top: 12, right: 14, bottom: 4, left: -18 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'rgba(18,17,22,0.96)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff',
                }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }} />
              {DOMAIN_LINES.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="trend-overview__side">
          <div className="trend-overview__review">
            <span className="trend-overview__eyebrow">Week Review</span>
            <h4>{review.title}</h4>
            <p>{review.body}</p>
          </div>

          <div className="trend-overview__metrics">
            {DOMAIN_LINES.map((line) => (
              <div key={line.key} className="trend-overview__metric">
                <span className="trend-overview__metric-label">{line.label}</span>
                <strong style={{ color: line.color }}>{summary[line.key]}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="trend-overview__correlations">
        {correlations.map((item) => (
          <div key={item.title} className={`trend-overview__correlation trend-overview__correlation--${item.tone}`}>
            <span className="material-symbols-outlined">{item.icon}</span>
            <div>
              <p>{item.title}</p>
              <strong>{item.label === 'Collecting' ? item.label : `${item.label}: ${item.score}`}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
