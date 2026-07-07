/**
 * HobbiesPage — Creative Matrix with hobby time tracking, skill visualization.
 */
import { useState, useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import MascotHero from '../components/MascotHero';
import LogFlowActions from '../components/LogFlowActions';
import './HobbiesPage.css';

export default function HobbiesPage() {
  const { todayLog, hobbies, settings, setHobbyTime, addHobby, removeHobby, lifeScore } = useDailyLog();
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const hobbyPct = Math.round(lifeScore.breakdown.hobbies || 0);

  const totalMinutes = useMemo(() => {
    return Object.values(todayLog.hobbies).reduce((sum, m) => sum + (m || 0), 0);
  }, [todayLog.hobbies]);

  const handleAdd = () => {
    if (newName.trim()) { addHobby(newName.trim(), '🎨'); setNewName(''); setShowAdd(false); }
  };

  return (
    <div className="hobbies stagger-children">
      {/* Header */}
      <div className="hobbies__header">
        <div>
          <h2 className="hobbies__page-title">CREATIVE_MATRIX</h2>
          <div className="hobbies__header-meta">
            <div className="chip chip-hobbies"><span className="hobbies__pulse-dot" />Flow State: {totalMinutes > 30 ? 'ACTIVE' : 'STANDBY'}</div>
          </div>
        </div>
        <div className="glass-card hobbies__session-stats">
          <div className="hobbies__stat-block"><p className="text-label-sm" style={{ color: 'var(--outline)' }}>Total Today</p><p className="hobbies__stat-number">{totalMinutes} min</p></div>
          <div className="hobbies__stat-divider" />
          <div className="hobbies__stat-block"><p className="text-label-sm" style={{ color: 'var(--outline)' }}>Mastery Level</p><p className="hobbies__stat-number" style={{ color: 'var(--domain-hobbies)' }}>{hobbyPct >= 80 ? 'ELITE' : hobbyPct >= 50 ? 'ADVANCED' : 'RISING'}</p></div>
        </div>
      </div>

      {/* Hero */}
      <div className="hobbies__hero">
        <div className="glass-card hobbies__mastery-card domain-glow-hobbies">
          <div className="hobbies__mastery-content">
            <span className="chip" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--on-surface-variant)' }}>Daily Feature</span>
            <h3 className="hobbies__mastery-title">Mastery & <span style={{ color: 'var(--domain-hobbies)' }}>Flow</span></h3>
            <p className="hobbies__mastery-desc">Your creative momentum is {hobbyPct >= 60 ? 'peaking' : 'building'}. Engage the matrix to manifest your visions. Target: {settings.hobbyTarget || 60} min/day.</p>
            <button className="btn-primary" style={{ background: 'var(--domain-hobbies)', color: 'white', boxShadow: '0 4px 20px rgba(255,77,255,0.3)' }} onClick={() => document.querySelector('.hobbies__log-section')?.scrollIntoView({ behavior: 'smooth' })}>INITIALIZE CANVAS</button>
          </div>
            <MascotHero domain="hobbies" size="xl" className="hobbies__mastery-visual" />
          <div className="hobbies__mastery-ring-bg" />
        </div>

        <div className="glass-card hobbies__attributes">
          <h4 className="hobbies__attr-title">Creative Attributes</h4>
          <div className="hobbies__attr-list">
            {hobbies.length === 0 && (
              <div className="hobbies__empty-state">
                <span className="material-symbols-outlined">add_circle</span>
                <p>Add a hobby to begin tracking creative time.</p>
              </div>
            )}
            {hobbies.map(h => {
              const mins = todayLog.hobbies[h.id] || 0;
              const target = (settings.hobbyTarget || 60) / Math.max(1, hobbies.length);
              const pct = Math.min(100, (mins / target) * 100);
              return (
                <div key={h.id} className="hobbies__attr-row">
                  <span className="hobbies__attr-name">{h.icon} {h.name}</span>
                  <div className="hobbies__attr-bar-track">
                    <div className="hobbies__attr-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="hobbies__attr-val">{mins}m</span>
                </div>
              );
            })}
          </div>
          <div className="hobbies__overall">
            <div className="hobbies__overall-labels"><span>Overall Progress</span><span style={{ color: 'var(--domain-hobbies)' }}>{hobbyPct}%</span></div>
            <div className="hobbies__overall-bar-track"><div className="hobbies__overall-bar-fill" style={{ width: `${hobbyPct}%` }} /></div>
          </div>
        </div>
      </div>

      {/* Hobby Log */}
      <div className="hobbies__log-section">
        <div className="hobbies__log-header">
          <h3 className="hobbies__log-title">
            <span className="material-symbols-outlined" style={{ color: 'var(--domain-hobbies)' }}>timer</span>
            Session Log
          </h3>
          <button className="btn-icon" style={{ color: 'var(--domain-hobbies)' }} onClick={() => setShowAdd(v => !v)}>
            <span className="material-symbols-outlined">add_circle</span>
          </button>
        </div>
        {showAdd && (
          <div className="hobbies__add-row">
            <input type="text" placeholder="New hobby name..." value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()} className="hobbies__add-input" />
            <button className="btn-primary" onClick={handleAdd}
              style={{ background: 'var(--domain-hobbies)', color: '#fff', padding: '8px 16px', fontSize: '11px' }}>Add</button>
          </div>
        )}
        {hobbies.length === 0 && (
          <div className="hobbies__empty-state hobbies__empty-state--wide">
            <span className="material-symbols-outlined">palette</span>
            <p>No hobbies yet. Add your first creative skill with the plus button.</p>
          </div>
        )}
        <div className="hobbies__log-grid">
          {hobbies.map(h => {
            const mins = todayLog.hobbies[h.id] || 0;
            return (
              <div key={h.id} className="glass-card hobbies__log-card">
                <div className="hobbies__log-card-header">
                  <span className="hobbies__log-icon">{h.icon}</span>
                  <span className="hobbies__log-name">{h.name}</span>
                  <button className="hobbies__log-delete" onClick={() => removeHobby(h.id)}>
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
                <div className="hobbies__log-value">{mins}<span className="hobbies__log-unit">min</span></div>
                <input type="range" min="0" max="180" step="5" value={mins}
                  onChange={e => setHobbyTime(h.id, Number(e.target.value))} className="slider-hobbies" />
                <div className="hobbies__log-slider-labels"><span>0</span><span>180 min</span></div>
              </div>
            );
          })}
        </div>
      </div>
      <LogFlowActions
        domain="hobbies"
        nextPath="/"
        nextLabel="Hub"
        summary={{
          title: 'Hobby check-in',
          items: [
            { label: 'Hobbies tracked', value: hobbies.length },
            { label: 'Total time today', value: `${totalMinutes} min` },
            { label: 'Daily target', value: `${settings.hobbyTarget || 60} min` },
          ],
        }}
      />
    </div>
  );
}
