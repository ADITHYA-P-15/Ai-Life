/**
 * MindPage — Mood/Mind domain page with 3D mascot, neural calibration, mood trend.
 */
import { useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { MOOD_EMOJIS, MOOD_LABELS } from '../utils/categories';
import { getLastNDays } from '../utils/dates';
import MascotHero from '../components/MascotHero';
import LogFlowActions from '../components/LogFlowActions';
import './MindPage.css';

const MOOD_TAGS = ['😴 Tired', '💪 Energized', '😤 Stressed', '🎯 Focused', '😔 Low', '🤩 Great', '😌 Relaxed', '🔥 Productive'];
const NOTE_PROMPTS = [
  'What made today feel this way?',
  'What are you grateful for today?',
  'What would you change about today?',
  "What was today's highlight?",
];

export default function MindPage() {
  const { todayLog, history, setMood, toggleMoodTag, toggleMicroWin, lifeScore } = useDailyLog();
  const score = todayLog.mood.score;
  const hasMindLog = todayLog.hasLog && score > 0;
  const sliderScore = score > 0 ? score : 5;
  const moodPct = Math.round(lifeScore.breakdown.mood || 0);
  const todayStr = new Date().toISOString().split('T')[0];
  const notePrompt = NOTE_PROMPTS[new Date(todayStr).getDate() % NOTE_PROMPTS.length];
  const weekData = useMemo(() => {
    const days = getLastNDays(7);
    return days.map(dateStr => {
      const log = history.find(h => h.date === dateStr);
      const d = new Date(dateStr);
      const label = d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 3).toUpperCase();
      return { label, score: log?.mood?.score || 0, isToday: dateStr === todayStr };
    });
  }, [history, todayStr]);

  const moodLabel = hasMindLog ? MOOD_LABELS[score] : 'Not logged';
  const moodState = hasMindLog
    ? score >= 8
      ? 'Strong energy and clear focus are showing today.'
      : score >= 6
        ? 'You feel steady and fairly present.'
        : score >= 4
          ? 'You are carrying mixed energy and could use a softer reset.'
          : 'You are feeling heavy, so a gentle recovery step would help.'
    : 'Choose an emoji to start your check-in.';
  const calibrationLabel = hasMindLog
    ? score >= 8
      ? 'Flow mode'
      : score >= 6
        ? 'Balanced mode'
        : score >= 4
          ? 'Reset mode'
          : 'Recovery mode'
    : 'Ready to tune';
  const calibrationHint = hasMindLog
    ? score >= 7
      ? 'Your rhythm is already strong, so keep the next step small.'
      : score >= 4
        ? 'A calmer rhythm and one simple ritual would help this state settle.'
        : 'Recovery comes first right now, so lower the pressure and protect rest.'
    : 'Use the slider to set the energy level you want to carry today.';

  const handleEmojiClick = (val) => setMood({ score: val });
  const handleSlider = (e) => {
    const nextScore = Math.max(1, Math.min(10, Math.round(Number(e.target.value) / 10)));
    setMood({ score: nextScore });
  };
  const handleNote = (e) => setMood({ note: e.target.value });

  return (
    <div className="mind stagger-children">
      <div className="mind__grid">
        {/* Left column */}
        <div className="mind__left">
          <div className="glass-card mind__status-card domain-glow-mind">
            <div className="mind__status-bg" aria-hidden="true" />
            <MascotHero domain="mind" size="lg" className="mind__mascot" />
            <div className="mind__status-text">
              <h3 className="mind__status-label">
                Neural Status: <span style={{ color: 'var(--domain-mind)' }}>{hasMindLog ? MOOD_LABELS[score] : 'Not logged'}</span>
              </h3>
              <p className="mind__status-sub">
                {hasMindLog ? `Your cognitive resonance is at ${moodPct}% capacity.` : 'Start with one mood signal to activate this domain.'}
                {hasMindLog && (score >= 7 ? ' Peak performance detected.' : ' Room for optimization.')}
              </p>
            </div>
          </div>
          <div className="glass-card mind__load-card glass-card--no-hover">
            <p className="text-label-sm" style={{ color: 'var(--outline)' }}>Cognitive Load</p>
            <div className="mind__load-row">
              <span className="mind__load-pct">{hasMindLog ? score * 10 : 0}<span className="mind__load-unit">%</span></span>
              <svg viewBox="0 0 100 100" className="mind__load-ring">
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--surface-variant)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="transparent" stroke="var(--domain-mind)" strokeWidth="8"
                  strokeDasharray="264" strokeDashoffset={264 * (1 - (hasMindLog ? score * 10 : 0) / 100)} strokeLinecap="round"
                  className="progress-ring-circle" style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.5))' }} />
              </svg>
            </div>
            <p className="mind__load-text">{hasMindLog ? (score >= 6 ? 'Optimal processing window open' : 'Neural pathways need calibration') : 'No mood logged yet'}</p>
          </div>
        </div>

        {/* Right column */}
        <div className="mind__right">
          {/* Mood Trend */}
          <div className="glass-card mind__trend glass-card--no-hover">
            <div className="mind__trend-header">
              <div>
                <h3 className="text-headline-md mind__trend-title">
                  <span className="material-symbols-outlined" style={{ color: 'var(--domain-mind)' }}>show_chart</span>
                  Mood Stability
                </h3>
                <p className="mind__trend-sub">7-day emotional resonance trend</p>
              </div>
              {moodPct >= 50 && (
                <span className="chip chip-mind">+{Math.min(10, moodPct - 40).toFixed(1)}% Stability</span>
              )}
            </div>
            <div className="mind__chart">
              <div className="mind__chart-grid" aria-hidden="true" />
              {weekData.map((d, i) => (
                <div key={i} className="mind__chart-col">
                  <div className="mind__chart-bar-wrapper">
                    <div className={`mind__chart-bar ${d.isToday ? 'mind__chart-bar--today' : ''}`} style={{ height: `${Math.max(8, d.score * 10)}%` }} />
                  </div>
                  <span className="mind__chart-label">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom two cards */}
          <div className="mind__bottom-grid">
            {/* Emoji Grid */}
            <div className="glass-card mind__emoji-card glass-card--no-hover">
              <div className="mind__card-heading">
                <p className="text-label-sm" style={{ color: 'var(--outline)' }}>Current emotional state</p>
                <span className="mind__state-pill">{moodLabel}</span>
              </div>
              <div className="mind__state-preview">
                <div className="mind__state-emoji">{hasMindLog ? MOOD_EMOJIS[score] : '✨'}</div>
                <div>
                  <h4 className="mind__state-title">{hasMindLog ? moodLabel : 'Pick a mood'}</h4>
                  <p className="mind__state-copy">{moodState}</p>
                </div>
              </div>
              <div className="mind__emoji-grid">
                {Object.entries(MOOD_EMOJIS).map(([val, emoji]) => (
                  <button key={val} className={`mind__emoji-btn ${hasMindLog && Number(val) === score ? 'mind__emoji-btn--active' : ''}`}
                    onClick={() => handleEmojiClick(Number(val))}>
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Neural Calibration */}
            <div className="glass-card mind__calibration glass-card--no-hover">
              <div className="mind__card-heading">
                <p className="text-label-sm" style={{ color: 'var(--outline)' }}>Neural calibration</p>
                <span className="mind__state-pill mind__state-pill--accent">{calibrationLabel}</span>
              </div>
              <div className="mind__calibration-preview">
                <div className="mind__calibration-score">{sliderScore}/10</div>
                <div className="mind__calibration-copy">
                  <strong>{calibrationLabel}</strong>
                  <p>{calibrationHint}</p>
                </div>
              </div>
              <input type="range" min="10" max="100" step="10" value={sliderScore * 10} onChange={handleSlider} className="slider-mind mind__slider" />
              <div className="mind__calibration-labels">
                <span>ZEN</span><span>FLOW</span><span>OVERDRIVE</span>
              </div>
              <div className="mind__tag-row" aria-label="Mood tags">
                {MOOD_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`mind__tag ${todayLog.mood.tags?.includes(tag) ? 'mind__tag--active' : ''}`}
                    onClick={() => toggleMoodTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="mind__calibration-actions">
                <textarea className="mind__note" rows="2" placeholder={notePrompt} value={todayLog.mood.note || ''} onChange={handleNote} />
                <button
                  type="button"
                  className={`mind__micro-win ${todayLog.microWin ? 'mind__micro-win--active' : ''}`}
                  onClick={toggleMicroWin}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: todayLog.microWin ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                  Micro win
                </button>
              </div>
              <button className="btn-primary mind__sync-btn" style={{ background: 'var(--domain-mind)', color: '#000', boxShadow: '0 4px 20px rgba(0,229,255,0.3)' }}
                onClick={() => setMood({ score: sliderScore })}>
                APPLY STATE
              </button>
            </div>
          </div>
        </div>
      </div>
      <LogFlowActions
        domain="mind"
        nextPath="/sleep"
        nextLabel="Sleep"
        onConfirm={() => score > 0 && setMood({ score, note: todayLog.mood.note || '' })}
        summary={{
          title: 'Mind check-in',
          items: [
            { label: 'Mood score', value: hasMindLog ? `${score}/10` : 'Not logged' },
            { label: 'Mood label', value: hasMindLog ? MOOD_LABELS[score] : 'Blank' },
            { label: 'Tags', value: todayLog.mood.tags?.length ? todayLog.mood.tags.length : 'None' },
            { label: 'Micro win', value: todayLog.microWin ? 'Starred' : 'No' },
            { label: 'Note', value: todayLog.mood.note ? 'Added' : 'Empty' },
          ],
        }}
      />
    </div>
  );
}
