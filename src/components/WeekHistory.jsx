/**
 * WeekHistory — 7-day mini-history strip.
 *
 * Displays a horizontal row of glass-card columns, one per day of the
 * last 7 days. Each column shows day abbreviation, date number, a
 * mood-proportional colored dot, sleep hours, and habit completion
 * fraction. Today's column gets a cyan glow highlight.
 */

import { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getLastNDays, getToday } from '../utils/dates.js';
import './WeekHistory.css';

const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function WeekHistory() {
  const { state } = useApp();
  const today = getToday();

  // Build a lookup map: date string → log object
  const logMap = useMemo(() => {
    const map = new Map();

    // Add history entries
    if (state.history) {
      for (const log of state.history) {
        if (log.date) {
          map.set(log.date, log);
        }
      }
    }

    // Add today's log (overwrites if already in history)
    if (state.todayLog?.date) {
      map.set(state.todayLog.date, state.todayLog);
    }

    return map;
  }, [state.history, state.todayLog]);

  // Get the 7-day date strings (oldest first)
  const days = useMemo(() => getLastNDays(7), []);

  // Count active habits for the denominator
  const activeHabitCount = useMemo(
    () => (state.habits ? state.habits.filter((h) => h.active !== false).length : 0),
    [state.habits]
  );

  return (
    <section className="week-history" aria-label="7-day history">
      <div className="week-history__title">This Week</div>
      <div className="week-history__strip">
        {days.map((dateStr) => {
          const isToday = dateStr === today;
          const log = logMap.get(dateStr);
          const dateObj = new Date(dateStr + 'T00:00:00');
          const dayAbbr = DAY_ABBRS[dateObj.getDay()];
          const dayNum = dateObj.getDate();

          // Extract data from log
          const moodScore = log?.mood?.score;
          const sleepHours = log?.sleep?.hours;
          const habitsCompleted = log?.habits
            ? Object.values(log.habits).filter(Boolean).length
            : null;

          // Mood dot size: scale from 6px (score=1) to 16px (score=10)
          const moodDotSize =
            moodScore != null
              ? Math.max(6, Math.round(6 + ((moodScore - 1) / 9) * 10))
              : 0;

          return (
            <article
              key={dateStr}
              className={`week-history__day ${isToday ? 'week-history__day--today' : ''}`}
            >
              {/* Day header */}
              <div className="week-history__day-header">
                <span className="week-history__day-abbr">{dayAbbr}</span>
                <span className="week-history__day-num">{dayNum}</span>
              </div>

              {/* Mood dot */}
              <div className="week-history__mood">
                {moodScore != null ? (
                  <span
                    className="week-history__mood-dot"
                    style={{ width: moodDotSize, height: moodDotSize }}
                    title={`Mood: ${moodScore}/10`}
                  />
                ) : (
                  <span className="week-history__mood-dot week-history__mood-dot--empty" />
                )}
              </div>

              {/* Sleep */}
              {sleepHours != null ? (
                <span className="week-history__sleep" title={`Sleep: ${sleepHours}h`}>
                  <span className="week-history__sleep-icon">🌙</span>
                  {sleepHours}h
                </span>
              ) : (
                <span className="week-history__empty">—</span>
              )}

              {/* Habits */}
              {habitsCompleted != null && activeHabitCount > 0 ? (
                <span
                  className="week-history__habits"
                  title={`Habits: ${habitsCompleted}/${activeHabitCount}`}
                >
                  {habitsCompleted}/{activeHabitCount}
                </span>
              ) : (
                <span className="week-history__empty">—</span>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
