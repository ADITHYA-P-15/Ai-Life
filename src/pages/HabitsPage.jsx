/**
 * HabitsPage — Habit Protocol with daily quests, streaks, heatmap.
 */
import { useState, useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { getStreakTier } from '../utils/streaks';
import { getLastNDays } from '../utils/dates';
import MascotHero from '../components/MascotHero';
import LogFlowActions from '../components/LogFlowActions';
import './HabitsPage.css';

export default function HabitsPage() {
  const { todayLog, history, habits, streaks, toggleHabit, addHabit, removeHabit, lifeScore } = useDailyLog();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const habitPct = Math.round(lifeScore.breakdown.habits || 0);
  const doneCount = habits.filter(h => todayLog.habits[h.id]).length;

  const topStreak = useMemo(() => {
    const entries = Object.entries(streaks).map(([id, s]) => ({ id, ...s }));
    entries.sort((a, b) => b.current - a.current);
    const top = entries[0];
    if (!top) return null;
    const habit = habits.find(h => h.id === top.id);
    return { ...top, name: habit?.name || 'Habit' };
  }, [streaks, habits]);

  const handleAdd = () => {
    if (newName.trim()) { addHabit(newName.trim(), '⚡'); setNewName(''); setShowAdd(false); }
  };

  const heatCells = useMemo(() => {
    const logMap = new Map();
    history.forEach((log) => log.date && logMap.set(log.date, log));
    if (todayLog.date) logMap.set(todayLog.date, todayLog);

    return getLastNDays(91).map((date) => {
      const log = logMap.get(date);
      if (!log?.hasLog || habits.length === 0) return 0;
      const completed = habits.filter((habit) => log.habits?.[habit.id]).length;
      const rate = completed / habits.length;
      if (rate === 0) return 0;
      if (rate < 0.25) return 1;
      if (rate < 0.5) return 2;
      if (rate < 0.85) return 3;
      return 4;
    });
  }, [history, todayLog, habits]);

  return (
    <div className="habits stagger-children">
      {/* Hero */}
      <div className="habits__hero">
        <div className="habits__hero-text">
          <div className="chip chip-habits"><span className="habits__pulse-dot" />Shield Active</div>
          <h1 className="habits__hero-title">Fortified <span style={{ color: 'var(--domain-habits)' }}>Consistency</span></h1>
          <p className="habits__hero-desc">Protocol active. Daily defense at <strong style={{ color: 'white' }}>{habitPct}% efficiency</strong>. {doneCount}/{habits.length} quests completed today.</p>
          <div className="habits__hero-actions">
            <button className="btn-primary habits__launch-btn" onClick={() => document.querySelector('.habits__quests')?.scrollIntoView({ behavior: 'smooth' })}>
              <span className="material-symbols-outlined">bolt</span> Launch Ritual
            </button>
            <button className="btn-outline habits__logs-btn" onClick={() => document.querySelector('.habits__heatmap')?.scrollIntoView({ behavior: 'smooth' })}>View Logs</button>
          </div>
        </div>
        <div className="habits__hero-visual">
          <MascotHero domain="habits" size={320} className="habits__mascot-hero" />
        </div>      </div>

      <div className="habits__main-grid">
        {/* Left: Heatmap + Stats */}
        <div className="habits__left">
          <div className="glass-card habits__heatmap habits__panel-accent">
            <div className="habits__heatmap-header">
              <h3 className="habits__heatmap-title"><span className="material-symbols-outlined" style={{ color: 'var(--domain-habits)' }}>grid_view</span> Persistence Matrix</h3>
              <div className="habits__heatmap-legend">
                <span className="habits__legend-label">Less</span>
                {[0,1,2,3,4].map(i => <div key={i} className={`habits__heat-cell habits__heat-cell--${i}`} />)}
                <span className="habits__legend-label">More</span>
              </div>
            </div>
            <div className="habits__heatmap-grid">
              {heatCells.map((v, i) => <div key={i} className={`habits__heat-cell habits__heat-cell--${v}`} />)}
            </div>
            <div className="habits__heatmap-stats">
              <div><p className="habits__stat-label">Annual Success</p><p className="habits__stat-value">{habitPct}%</p></div>
              <div><p className="habits__stat-label">Avg Daily Score</p><p className="habits__stat-value">{(doneCount / Math.max(1, habits.length) * 5).toFixed(1)}</p></div>
              <div><p className="habits__stat-label">Active Habits</p><p className="habits__stat-value">{habits.length}</p></div>
            </div>
          </div>

          <div className="habits__stats-grid">
            {/* Current Streak */}
            <div className="glass-card habits__streak-card">
              <div className="habits__streak-header">
                <div><p className="text-label-sm" style={{ color: 'var(--outline)' }}>Current Streak</p><p className="habits__streak-name">{topStreak?.name || 'None'}</p></div>
                <div className="habits__streak-icon-wrap"><span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: 'var(--domain-habits)' }}>local_fire_department</span></div>
              </div>
              <div className="habits__streak-count"><span className="habits__streak-number">{topStreak?.current || 0}</span> <span className="habits__streak-unit">Days Consecutive</span></div>
              <div className="habits__streak-bar-track"><div className="habits__streak-bar-fill" style={{ width: `${Math.min(100, (topStreak?.current || 0) * 5)}%` }} /></div>
            </div>

            {/* Shield Integrity */}
            <div className="glass-card habits__shield-card">
              <p className="text-label-sm" style={{ color: 'var(--outline)' }}>Shield Integrity</p>
              <p className="habits__shield-sub">System Health</p>
              <div className="habits__shield-ring-wrap">
                <svg viewBox="0 0 100 100" className="habits__shield-ring">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--surface-variant)" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--domain-habits)" strokeWidth="8"
                    strokeDasharray="251" strokeDashoffset={251 * (1 - habitPct / 100)} strokeLinecap="round"
                    className="progress-ring-circle" style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.5))' }} />
                </svg>
                <span className="habits__shield-pct">{habitPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Daily Quests */}
        <div className="glass-card habits__quests habits__panel-accent">
          <div className="habits__quests-header">
            <h3 className="habits__quests-title"><span className="material-symbols-outlined" style={{ color: 'var(--domain-habits)' }}>task_alt</span> Daily Quests</h3>
            <button className="btn-icon" style={{ color: 'var(--domain-habits)' }} onClick={() => setShowAdd(v => !v)}>
              <span className="material-symbols-outlined">add_circle</span>
            </button>
          </div>

          {showAdd && (
            <div className="habits__add-row">
              <input type="text" placeholder="New quest name..." value={newName} onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAdd()} className="habits__add-input" />
              <button className="btn-primary habits__add-btn" onClick={handleAdd}
                style={{ background: 'var(--domain-habits)', color: '#000', padding: '8px 16px', fontSize: '11px' }}>Add</button>
            </div>
          )}

          <div className="habits__quest-list">
            {habits.length === 0 && (
              <div className="habits__quest-empty">
                <span className="material-symbols-outlined">add_task</span>
                <p>No daily quests yet. Add one tiny habit to start tracking.</p>
              </div>
            )}
            {habits.map(h => {
              const done = !!todayLog.habits[h.id];
              const tier = getStreakTier(streaks[h.id]?.current || 0);
              return (
                <div key={h.id} className={`habits__quest-item ${done ? 'habits__quest-item--done' : ''}`}>
                  <div className="habits__quest-check" onClick={() => toggleHabit(h.id)}>
                    <div className={`habits__checkbox ${done ? 'habits__checkbox--checked' : ''}`}>
                      {done && <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#000' }}>check</span>}
                    </div>
                  </div>
                  <div className="habits__quest-info">
                    <p className="habits__quest-name">{h.icon} {h.name}</p>
                    <p className="habits__quest-xp">{tier.emoji} {streaks[h.id]?.current || 0}d • +{(streaks[h.id]?.current || 0) * 50} XP</p>
                  </div>
                  <button className="habits__quest-delete" onClick={() => removeHabit(h.id)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="habits__multiplier">
            <span className="habits__pulse-dot" />
            <span className="text-label-sm" style={{ color: 'var(--domain-habits)' }}>Daily Multiplier: {doneCount >= 3 ? '1.5x' : '1x'} {doneCount >= 3 ? 'Active' : 'Inactive'}</span>
          </div>
        </div>
      </div>
      <LogFlowActions
        domain="habits"
        nextPath="/money"
        nextLabel="Money"
        summary={{
          title: 'Habit check-in',
          items: [
            { label: 'Active habits', value: habits.length },
            { label: 'Completed today', value: `${doneCount}/${habits.length}` },
            { label: 'Top streak', value: topStreak ? `${topStreak.name}: ${topStreak.current}d` : 'None' },
          ],
        }}
      />
    </div>
  );
}
