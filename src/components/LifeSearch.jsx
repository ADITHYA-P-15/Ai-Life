import { useMemo, useState } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { formatDate } from '../utils/dates';
import './LifeSearch.css';

const SAMPLE_QUERIES = ['Happy days', 'Poor sleep', 'Gym', 'Expenses', 'High mood'];

function getExpenseTotal(log) {
  return (log?.expenses || []).reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
}

function getHobbyMinutes(log) {
  return Object.values(log?.hobbies || {}).reduce((sum, minutes) => sum + Number(minutes || 0), 0);
}

function getMoodLabel(score) {
  if (!score) return 'No mood';
  if (score >= 8) return 'Thriving';
  if (score >= 6) return 'Steady';
  if (score >= 4) return 'Mixed';
  return 'Low';
}

export default function LifeSearch() {
  const { todayLog, history, habits } = useDailyLog();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const logs = [...history, todayLog].filter((log) => log?.hasLog);
    const exerciseHabit = habits.find((habit) => /exercise|gym|run|walk|workout/i.test(habit.name));

    return logs
      .map((log) => {
        const moodScore = Number(log?.mood?.score || 0);
        const sleepHours = Number(log?.sleep?.hours || 0);
        const expenseTotal = getExpenseTotal(log);
        const hobbyMinutes = getHobbyMinutes(log);
        const completedHabits = Object.values(log?.habits || {}).filter(Boolean).length;
        const noteText = String(log?.mood?.note || '').toLowerCase();
        const tagText = (log?.mood?.tags || []).join(' ').toLowerCase();
        const habitNames = habits.filter((habit) => log?.habits?.[habit.id]).map((habit) => habit.name.toLowerCase());
        const matches = [];

        const isHighMood = moodScore >= 7;
        const isLowMood = moodScore <= 4;
        const isPoorSleep = sleepHours <= 6;
        const isExerciseDay = Boolean(exerciseHabit && log?.habits?.[exerciseHabit.id]);

        if ((q.includes('happy') || q.includes('high mood') || q.includes('good mood')) && isHighMood) matches.push('high mood');
        if ((q.includes('poor sleep') || q.includes('sleep')) && isPoorSleep) matches.push('poor sleep');
        if ((q.includes('gym') || q.includes('exercise') || q.includes('workout')) && isExerciseDay) matches.push('exercise');
        if ((q.includes('expense') || q.includes('spending') || q.includes('budget')) && expenseTotal > 0) matches.push('expense');
        if ((q.includes('hobby') || q.includes('creative')) && hobbyMinutes > 0) matches.push('hobby');
        if ((q.includes('habit') || q.includes('ritual')) && completedHabits > 0) matches.push('habit');
        if ((q.includes('note') || q.includes('journal')) && noteText) matches.push('note');
        if ((q.includes('mood') || q.includes('emotion')) && moodScore > 0) matches.push('mood');
        if (q.includes('tag') && tagText) matches.push('tag');

        if (habitNames.some((name) => name.includes(q))) matches.push('habit');
        if (noteText.includes(q) || tagText.includes(q)) matches.push('note');
        if (q.includes('high mood') && moodScore >= 7) matches.push('mood');

        return matches.length > 0 ? {
          date: log.date,
          title: `${formatDate(log.date)} · ${getMoodLabel(moodScore)}`,
          summary: `${moodScore > 0 ? `${moodScore}/10 mood` : 'Mood not logged'}, ${sleepHours > 0 ? `${sleepHours}h sleep` : 'No sleep logged'}, ${completedHabits} habit${completedHabits === 1 ? '' : 's'} completed.`,
          detail: expenseTotal > 0 ? `₹${Math.round(expenseTotal)} spent` : hobbyMinutes > 0 ? `${Math.round(hobbyMinutes)} min of hobbies` : 'No extra details logged yet.',
        } : null;
      })
      .filter(Boolean)
      .slice(0, 6);
  }, [history, todayLog, habits, query]);

  return (
    <section className="life-search glass-card glass-card--no-hover">
      <div className="life-search__header">
        <div>
          <span className="life-search__eyebrow">Search Your Life</span>
          <h3>Find a past day quickly</h3>
        </div>
      </div>

      <input
        type="text"
        className="life-search__input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Try: Happy days, Poor sleep, Gym…"
      />

      <div className="life-search__chips">
        {SAMPLE_QUERIES.map((sample) => (
          <button key={sample} type="button" className="life-search__chip" onClick={() => setQuery(sample)}>
            {sample}
          </button>
        ))}
      </div>

      {query ? (
        results.length > 0 ? (
          <ul className="life-search__results">
            {results.map((item) => (
              <li key={item.date}>
                <strong>{item.title}</strong>
                <p>{item.summary}</p>
                <small>{item.detail}</small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="life-search__empty">No matching moments found yet. Try a broader phrase like “mood” or “sleep”.</p>
        )
      ) : (
        <p className="life-search__empty">Search your history by mood, habits, sleep, hobbies, or spending.</p>
      )}
    </section>
  );
}
