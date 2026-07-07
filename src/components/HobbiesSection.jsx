import { useState, useRef, useEffect, useMemo } from 'react';
import { useDailyLog } from '../hooks/useDailyLog';
import './HobbiesSection.css';

/**
 * SVG progress ring — renders a circular progress indicator.
 */
function ProgressRing({ percent, totalMinutes }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(percent, 100);
  const offset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="hobbies-ring-wrapper">
      <svg className="hobbies-ring-svg" viewBox="0 0 80 80">
        <circle className="hobbies-ring-bg" cx="40" cy="40" r={radius} />
        <circle
          className="hobbies-ring-progress"
          cx="40"
          cy="40"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="hobbies-ring-label">
        <span className="hobbies-ring-value">{totalMinutes}</span>
        <span className="hobbies-ring-unit">min</span>
      </div>
    </div>
  );
}

export default function HobbiesSection() {
  const { todayLog, hobbies, settings, setHobbyTime, addHobby, removeHobby } = useDailyLog();

  const [isAdding, setIsAdding] = useState(false);
  const [newHobbyName, setNewHobbyName] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const totalMinutes = useMemo(() => {
    return hobbies.reduce((sum, h) => sum + (todayLog.hobbies[h.id] || 0), 0);
  }, [hobbies, todayLog.hobbies]);

  const target = settings.hobbyTarget;
  const progressPercent = target > 0 ? (totalMinutes / target) * 100 : 0;
  const targetMet = totalMinutes >= target;

  const handleAddSubmit = (e) => {
    e.preventDefault();
    const trimmed = newHobbyName.trim();
    if (trimmed) {
      addHobby(trimmed, '🎨');
      setNewHobbyName('');
      setIsAdding(false);
    }
  };

  const handleCancel = () => {
    setNewHobbyName('');
    setIsAdding(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <section className="hobbies-section glass-card">
      {/* Header */}
      <header className="hobbies-header">
        <div className="hobbies-header-icon">🎨</div>
        <h3 className="hobbies-header-title">Hobbies</h3>
      </header>

      {/* Summary: progress ring + text */}
      <div className="hobbies-summary">
        <ProgressRing percent={progressPercent} totalMinutes={totalMinutes} />
        <div className="hobbies-summary-info">
          <span className="hobbies-total-text">
            Total: {totalMinutes} min today
          </span>
          <span className="hobbies-target-text">
            Target: {target} min/day
          </span>
          <span
            className={`hobbies-target-badge ${
              targetMet ? 'hobbies-target-badge--met' : 'hobbies-target-badge--unmet'
            }`}
          >
            {targetMet ? '✓ Target met' : `${target - totalMinutes} min remaining`}
          </span>
        </div>
      </div>

      {/* Hobby list */}
      {hobbies.length > 0 ? (
        <div className="hobbies-list">
          {hobbies.map((hobby) => {
            const minutes = todayLog.hobbies[hobby.id] || 0;

            return (
              <div key={hobby.id} className="hobbies-row">
                <span className="hobbies-row-icon">{hobby.icon}</span>
                <span className="hobbies-row-name">{hobby.name}</span>

                <div className="hobbies-row-slider-wrapper">
                  <input
                    type="range"
                    className="hobbies-row-slider"
                    min={0}
                    max={180}
                    step={5}
                    value={minutes}
                    onChange={(e) => setHobbyTime(hobby.id, Number(e.target.value))}
                    aria-label={`${hobby.name} time`}
                  />
                </div>

                <span
                  className={`hobbies-row-value${minutes > 0 ? ' hobbies-row-value--active' : ''}`}
                >
                  {minutes}m
                </span>

                <button
                  className="hobbies-delete-btn"
                  onClick={() => removeHobby(hobby.id)}
                  aria-label={`Remove ${hobby.name}`}
                  title="Remove hobby"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="hobbies-empty">
          <p>No hobbies yet. Add one to start logging time!</p>
        </div>
      )}

      {/* Add hobby */}
      <div className="hobbies-add-section">
        {isAdding ? (
          <form className="hobbies-add-form" onSubmit={handleAddSubmit}>
            <input
              ref={inputRef}
              className="hobbies-add-input"
              type="text"
              placeholder="New hobby name..."
              value={newHobbyName}
              onChange={(e) => setNewHobbyName(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={40}
            />
            <button type="submit" className="hobbies-add-submit">
              Add
            </button>
            <button type="button" className="hobbies-add-cancel" onClick={handleCancel}>
              Cancel
            </button>
          </form>
        ) : (
          <button className="hobbies-add-btn" onClick={() => setIsAdding(true)}>
            <span>+</span>
            <span>Add Hobby</span>
          </button>
        )}
      </div>
    </section>
  );
}
