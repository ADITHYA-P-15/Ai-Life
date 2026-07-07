/**
 * SleepPage — Sleep/Recovery domain page with cloud mascot, hours slider, trend chart.
 */
import { useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import { SLEEP_QUALITIES } from '../utils/categories';
import { getLastNDays } from '../utils/dates';
import MascotHero from '../components/MascotHero';
import LogFlowActions from '../components/LogFlowActions';
import './SleepPage.css';

export default function SleepPage() {
  const { todayLog, history, setSleep, lifeScore } = useDailyLog();
  const hours = todayLog.sleep.hours;
  const quality = todayLog.sleep.quality;
  const hasSleepLog = todayLog.hasLog && hours > 0;
  const sleepPct = Math.round(lifeScore.breakdown.sleep || 0);
  const sleepDebt = Math.max(0, 8 - hours).toFixed(1);

  const todayStr = new Date().toISOString().split('T')[0];
  const weekData = useMemo(() => {
    const days = getLastNDays(7);
    return days.map(dateStr => {
      const log = history.find(h => h.date === dateStr);
      const d = new Date(dateStr);
      const label = d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 3).toUpperCase();
      return { label, hours: log?.sleep?.hours || 0, isToday: dateStr === todayStr };
    });
  }, [history, todayStr]);

  return (
    <div className="sleep stagger-children">
      {/* Hero */}
      <div className="sleep__hero">
        <div className="glass-card sleep__recovery-card domain-glow-sleep">
          <div className="sleep__recovery-blob" />
          <div className="sleep__recovery-content">
            <div className="chip chip-sleep"><span className="sleep__pulse-dot" />Recovery Phase</div>
            <h2 className="text-display-lg-mobile sleep__recovery-title">
              {hasSleepLog ? 'Logged' : 'Pending'} <span style={{ color: 'var(--domain-sleep)' }}>Rejuvenation</span>
            </h2>
            <p className="sleep__recovery-desc">
              {hasSleepLog ? `You logged ${hours}h of sleep. Quality: ${quality || 'not rated'}.` : 'Log your sleep to begin recovery analysis.'}
              {' '}Recovery level at <strong>{sleepPct}%</strong>.
            </p>
          </div>
          <MascotHero domain="sleep" size="md" variant="cloud" className="sleep__mascot" />
        </div>
        <div className="glass-card sleep__debt-card glass-card--no-hover" style={{ borderTop: '3px solid var(--domain-sleep)' }}>
          <p className="text-label-sm" style={{ color: 'var(--outline)' }}>Sleep Debt</p>
          <span className="sleep__debt-number">{sleepDebt}h</span>
          <div className="sleep__debt-bar-track">
            <div className="sleep__debt-bar-fill" style={{ width: `${Math.min(100, (hours / 8) * 100)}%` }} />
          </div>
          <p className="sleep__debt-text">{Number(sleepDebt) > 0 ? 'Recovery projected in 2-3 days' : 'No sleep debt detected ✓'}</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="sleep__input-grid">
        <div className="glass-card sleep__hours-card glass-card--no-hover">
          <p className="text-label-sm" style={{ color: 'var(--outline)' }}>Sleep Duration</p>
          <div className="sleep__hours-display">{hasSleepLog ? hours : 0}<span className="sleep__hours-unit">hrs</span></div>
          <input type="range" min="0" max="14" step="0.5" value={hours} onChange={e => setSleep({ hours: Number(e.target.value) })} className="slider-sleep" />
          <div className="sleep__hours-labels"><span>0h</span><span className="sleep__hours-optimal">7-9h optimal</span><span>14h</span></div>
        </div>
        <div className="glass-card sleep__quality-card glass-card--no-hover">
          <p className="text-label-sm" style={{ color: 'var(--outline)' }}>Sleep Quality</p>
          <div className="sleep__quality-pills">
            {SLEEP_QUALITIES.map(q => (
              <button key={q.value}
                className={`sleep__quality-pill ${hasSleepLog && quality === q.value ? 'sleep__quality-pill--active' : ''}`}
                onClick={() => setSleep({ quality: q.value })}>
                <span>{q.icon}</span>
                <span>{q.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trend */}
      <div className="glass-card sleep__trend glass-card--no-hover">
        <h3 className="text-headline-md sleep__trend-title">
          <span className="material-symbols-outlined" style={{ color: 'var(--domain-sleep)' }}>bar_chart</span>
          Sleep Duration Analysis
        </h3>
        <p className="sleep__trend-sub">Weekly hours: actual vs 8h goal</p>
        <div className="sleep__chart">
          {weekData.map((d, i) => (
            <div key={i} className="sleep__chart-col">
              <div className="sleep__chart-bar-wrapper">
                <div className="sleep__chart-goal" />
                <div className={`sleep__chart-bar ${d.isToday ? 'sleep__chart-bar--today' : ''}`}
                  style={{ height: `${Math.max(4, (d.hours / 14) * 100)}%` }} />
              </div>
              <span className="sleep__chart-val">{d.hours > 0 ? `${d.hours}h` : '—'}</span>
              <span className="sleep__chart-label">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="sleep__insights">
        {[
          { icon: 'thermostat', title: 'Ambient Temperature', desc: 'Keep bedroom at 18-20°C for optimal deep sleep cycles.' },
          { icon: 'brightness_7', title: 'Blue Light Protocol', desc: 'Reduce screen exposure 60 min before sleep onset.' },
          { icon: 'schedule', title: 'Bio-Rhythm Sync', desc: 'Maintain consistent sleep/wake times for circadian alignment.' },
        ].map((tip, i) => (
          <div key={i} className="glass-card sleep__insight-card glass-card--no-hover">
            <div className="sleep__insight-icon"><span className="material-symbols-outlined">{tip.icon}</span></div>
            <h4 className="sleep__insight-title">{tip.title}</h4>
            <p className="sleep__insight-desc">{tip.desc}</p>
          </div>
        ))}
      </div>
      <LogFlowActions
        domain="sleep"
        nextPath="/habits"
        nextLabel="Habits"
        onConfirm={() => hours > 0 && setSleep({ hours, quality })}
        summary={{
          title: 'Sleep check-in',
          items: [
            { label: 'Duration', value: hasSleepLog ? `${hours}h` : 'Not logged' },
            { label: 'Quality', value: hasSleepLog ? quality || 'Not rated' : 'Blank' },
            { label: 'Sleep debt', value: hasSleepLog ? `${sleepDebt}h` : 'Blank' },
          ],
        }}
      />
    </div>
  );
}
