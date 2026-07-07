import { useState, useRef, useEffect } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { getStreakTier } from '../utils/streaks.js';
import './HabitsSection.css';

export default function HabitsSection() {
  const { todayLog, habits, streaks, toggleHabit, addHabit, removeHabit } = useDailyLog();

  const [isAdding, setIsAdding] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const inputRef = useRef(null);

  // Focus input when adding
  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const completedCount = habits.filter((h) => todayLog.habits[h.id]).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const allDone = totalCount > 0 && completedCount === totalCount;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = newHabitName.trim();
    if (trimmed) {
      addHabit(trimmed, '✅');
      setNewHabitName('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewHabitName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <section className="habits-section glass-card">
      {/* Header */}
      <header className="habits-header">
        <div className="habits-header-icon">✅</div>
        <h3 className="habits-header-title">Habits</h3>
        <span className="habits-counter">
          {completedCount}/{totalCount} done
        </span>
      </header>

      {/* Progress bar */}
      <div className="habits-progress-wrapper">
        <div className="habits-progress-bar">
          <div
            className={`habits-progress-fill${allDone ? ' habits-progress-fill--complete' : ''}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Habit list */}
      {habits.length > 0 ? (
        <div className="habits-list">
          {habits.map((habit) => {
            const isDone = !!todayLog.habits[habit.id];
            const streak = streaks[habit.id] || { current: 0, longest: 0 };
            const tier = getStreakTier(streak.current);

            return (
              <div key={habit.id} className="habits-row">
                <span className="habits-row-icon">{habit.icon}</span>
                <span className={`habits-row-name${isDone ? ' habits-row-name--done' : ''}`}>
                  {habit.name}
                </span>

                {/* Streak badge */}
                <span
                  className={`habits-streak-badge${streak.current > 0 ? ' habits-streak-badge--active' : ''}`}
                >
                  <span>{tier.emoji}</span>
                  <span>{streak.current}d</span>
                </span>

                {/* Custom toggle */}
                <label className="habits-toggle">
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => toggleHabit(habit.id)}
                    aria-label={`Toggle ${habit.name}`}
                  />
                  <span className="habits-toggle-track" />
                </label>

                {/* Delete */}
                <button
                  className="habits-delete-btn"
                  onClick={() => removeHabit(habit.id)}
                  aria-label={`Remove ${habit.name}`}
                  title="Remove habit"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="habits-empty">
          <p>No habits yet. Add one to start tracking!</p>
        </div>
      )}

      {/* Add habit */}
      <div className="habits-add-section">
        {isAdding ? (
          <form className="habits-add-form" onSubmit={handleAddSubmit}>
            <input
              ref={inputRef}
              className="habits-add-input"
              type="text"
              placeholder="New habit name..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={40}
            />
            <button type="submit" className="habits-add-submit">
              Add
            </button>
            <button type="button" className="habits-add-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </form>
        ) : (
          <button className="habits-add-btn" onClick={() => setIsAdding(true)}>
            <span>+</span>
            <span>Add Habit</span>
          </button>
        )}
      </div>
    </section>
  );
}
