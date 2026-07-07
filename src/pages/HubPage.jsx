/**
 * HubPage — Main dashboard overview showing Life Score + domain cards.
 */
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDailyLog } from '../hooks/useDailyLog';
import DomainMascot from '../components/DomainMascot';
import TrendOverview from '../components/TrendOverview';
import PhaseFourPanel from '../components/PhaseFourPanel';
import DailyReflection from '../components/DailyReflection';
import CorrelationCards from '../components/CorrelationCards';
import LifeSearch from '../components/LifeSearch';
import MemoryCard from '../components/MemoryCard';
import './HubPage.css';

const DOMAINS = [
  { key: 'mood', path: '/mind', label: 'MIND', stat: 'Flow State', mascot: 'mind', color: 'var(--domain-mind)', glowClass: 'domain-glow-mind' },
  { key: 'sleep', path: '/sleep', label: 'SLEEP', stat: 'Recovery', mascot: 'sleep', color: 'var(--domain-sleep)', glowClass: 'domain-glow-sleep' },
  { key: 'habits', path: '/habits', label: 'HABITS', stat: 'Shield', mascot: 'habits', color: 'var(--domain-habits)', glowClass: 'domain-glow-habits' },
  { key: 'budget', path: '/money', label: 'MONEY', stat: 'Growth', mascot: 'money', color: 'var(--domain-money)', glowClass: 'domain-glow-money' },
  { key: 'hobbies', path: '/hobbies', label: 'HOBBIES', stat: 'Mastery', mascot: 'hobbies', color: 'var(--domain-hobbies)', glowClass: 'domain-glow-hobbies' },
];

const MASCOT_DELAYS = { mind: 0, sleep: 0.8, habits: 1.6, money: 2.4, hobbies: 3.2 };

export default function HubPage() {
  const { lifeScore, todayLog, habits, streaks, todayExpenses, settings, toggleHabit } = useDailyLog();
  const navigate = useNavigate();
  const score = lifeScore.total;
  const circumference = 2 * Math.PI * 42;
  const dashOffset = circumference * (1 - score / 100);

  const weakestDomain = useMemo(() => {
    const entries = Object.entries(lifeScore.breakdown);
    entries.sort((a, b) => a[1] - b[1]);
    const key = entries[0]?.[0];
    return DOMAINS.find(d => d.key === key)?.label || 'Sleep';
  }, [lifeScore.breakdown]);

  const recentItems = useMemo(() => {
    const items = [];
    if (todayLog.mood.score >= 7) items.push({ icon: 'psychology', color: 'var(--domain-mind)', bg: 'rgba(0,229,255,0.15)', title: 'Positive Mindset Detected', sub: 'Neural resonance is above average.', time: 'Today' });
    const topStreak = Object.entries(streaks).sort((a, b) => b[1].current - a[1].current)[0];
    if (topStreak && topStreak[1].current > 1) {
      const h = habits.find(h => h.id === topStreak[0]);
      items.push({ icon: 'local_fire_department', color: 'var(--domain-habits)', bg: 'rgba(16,185,129,0.15)', title: `${h?.name || 'Habit'} Streak: ${topStreak[1].current} Days`, sub: `+${topStreak[1].current * 20} XP earned.`, time: 'Active' });
    }
    if (todayExpenses > 0) items.push({ icon: 'trending_up', color: 'var(--domain-money)', bg: 'rgba(245,200,75,0.14)', title: `₹${todayExpenses.toLocaleString('en-IN')} Tracked`, sub: `${Math.round((todayExpenses / settings.dailyBudgetTarget) * 100)}% of daily budget used.`, time: 'Today' });
    if (todayLog.sleep.hours > 0) items.push({ icon: 'bedtime', color: 'var(--domain-sleep)', bg: 'rgba(205,192,233,0.15)', title: `${todayLog.sleep.hours}h Sleep Logged`, sub: `Quality: ${todayLog.sleep.quality || 'Not rated'}`, time: 'Last night' });
    if (items.length === 0) items.push({ icon: 'info', color: 'var(--primary)', bg: 'rgba(207,188,255,0.15)', title: 'Start Your Day', sub: 'Log your mood, sleep, and habits to see activity here.', time: 'Now' });
    return items.slice(0, 3);
  }, [todayLog, streaks, habits, todayExpenses, settings]);

  return (
    <div className="hub stagger-children">
      <div className="hub__hero">
        <div className="glass-card hub__score-card">
          <div className="hub__score-card-bg" />
          <h3 className="text-label-sm hub__score-label">Aggregate Potential</h3>
          <div className="hub__score-ring">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--surface-variant)" strokeWidth="8" />
              <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--primary)" strokeWidth="8"
                strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
                className="progress-ring-circle" style={{ filter: 'drop-shadow(0 0 12px rgba(207,188,255,0.5))' }} />
            </svg>
            <div className="hub__score-value">
              <span className="hub__score-number">{score}</span>
              <span className="hub__score-of">/ 100</span>
            </div>
          </div>
          <p className="hub__score-desc">
            Track your domains to optimize your <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Life Score</span>.
            Focus on <span style={{ color: 'var(--tertiary)', fontWeight: 700 }}>{weakestDomain}</span> to level up.
          </p>
          <button className="btn-primary hub__ritual-btn" onClick={() => navigate('/mind')}>DAILY RITUAL: INITIATE</button>
        </div>

        <div className="hub__domains">
          {DOMAINS.map(d => {
            const val = Math.round(lifeScore.breakdown[d.key] || 0);
            return (
              <Link key={d.key} to={d.path} className={`glass-card hub__domain-card ${d.glowClass}`}>
                <div className="hub__domain-header">
                  <div>
                    <h4 className="hub__domain-title">{d.label}</h4>
                    <p className="hub__domain-stat" style={{ color: d.color }}>{d.stat}: {val}%</p>
                  </div>
                  <DomainMascot domain={d.mascot} size={96} variant="chip" delay={MASCOT_DELAYS[d.mascot] || 0} className="hub__domain-mascot" />
                </div>
                <div className="hub__domain-bar-track">
                  <div className="hub__domain-bar-fill" style={{ width: `${val}%`, background: d.color, boxShadow: `0 0 10px ${d.color}` }} />
                </div>
                <div className="hub__domain-footer">
                  <span className="hub__domain-detail">{d.label} Domain</span>
                  <span className="hub__domain-arrow" style={{ color: d.color }}>
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="hub__secondary">
        <div className="glass-card hub__progression glass-card--no-hover">
          <h3 className="text-headline-md hub__section-title">
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>analytics</span>
            Recent Progression
          </h3>
          <div className="hub__activity-list">
            {recentItems.map((item, i) => (
              <div key={i} className="hub__activity-item">
                <div className="hub__activity-icon" style={{ background: item.bg, color: item.color }}>
                  <span className="material-symbols-outlined">{item.icon}</span>
                </div>
                <div className="hub__activity-text">
                  <p className="hub__activity-title">{item.title}</p>
                  <p className="hub__activity-sub">{item.sub}</p>
                </div>
                <span className="hub__activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card hub__rituals glass-card--no-hover">
          <h3 className="text-headline-md hub__section-title">Active Rituals</h3>
          <div className="hub__ritual-list">
            {habits.length === 0 && (
              <div className="hub__ritual-empty">
                <span className="material-symbols-outlined">add_task</span>
                <p>No active rituals yet.</p>
              </div>
            )}
            {habits.slice(0, 4).map(h => {
              const done = !!todayLog.habits[h.id];
              return (
                <div key={h.id} className={`hub__ritual-item ${done ? 'hub__ritual-item--done' : ''}`} onClick={() => toggleHabit(h.id)}>
                  <div className="hub__ritual-item-left">
                    <span className="material-symbols-outlined" style={{ color: done ? 'var(--primary)' : 'var(--on-surface-variant)' }}>
                      {done ? 'check_circle' : 'radio_button_unchecked'}
                    </span>
                    <span className="hub__ritual-name">{h.name}</span>
                  </div>
                  <span className="hub__ritual-status">{done ? 'DONE' : 'PENDING'}</span>
                </div>
              );
            })}
          </div>
          <Link to="/habits" className="btn-outline hub__customize-btn">Customize rituals</Link>
        </div>
      </div>

      <div className="hub__insight-grid">
        <DailyReflection />
        <MemoryCard />
      </div>

      <CorrelationCards />
      <LifeSearch />
      <TrendOverview />
      <PhaseFourPanel />
    </div>
  );
}
