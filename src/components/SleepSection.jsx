import { useApp } from '../context/AppContext';
import { SLEEP_QUALITIES } from '../utils/categories.js';
import './SleepSection.css';

export default function SleepSection() {
  const { state, dispatch } = useApp();
  const hours = state.todayLog.sleep.hours;
  const quality = state.todayLog.sleep.quality;

  const handleHoursChange = (e) => {
    dispatch({ type: 'SET_SLEEP', payload: { hours: Number(e.target.value) } });
  };

  const handleQualityChange = (value) => {
    dispatch({ type: 'SET_SLEEP', payload: { quality: value } });
  };

  const fillPercent = (hours / 14) * 100;

  // Optimal zone: 7h–9h on a 0–14 scale
  const optimalLeft = (7 / 14) * 100;
  const optimalWidth = ((9 - 7) / 14) * 100;

  // Determine hours quality label
  const getHoursLabel = () => {
    if (hours < 5) return 'Too little';
    if (hours < 7) return 'Below optimal';
    if (hours <= 9) return 'Optimal range ✓';
    if (hours <= 10) return 'Above optimal';
    return 'Too much';
  };

  return (
    <section className="sleep-section glass-card">
      {/* Header */}
      <header className="sleep-header">
        <div className="sleep-header-icon">😴</div>
        <h3 className="sleep-header-title">Sleep</h3>
      </header>

      {/* Hours display */}
      <div className="sleep-hours-display">
        <div>
          <span className="sleep-hours-value">{hours}</span>
          <span className="sleep-hours-unit">hrs</span>
        </div>
        <span className="sleep-hours-label">{getHoursLabel()}</span>
      </div>

      {/* Slider with optimal zone */}
      <div className="sleep-slider-wrapper">
        <div className="sleep-slider-track">
          <div className="sleep-slider-bg">
            <div
              className="sleep-slider-fill"
              style={{ width: `${fillPercent}%` }}
            />
          </div>

          {/* Optimal 7-9h zone */}
          <div
            className="sleep-optimal-zone"
            style={{
              left: `${optimalLeft}%`,
              width: `${optimalWidth}%`,
            }}
          >
            <span className="sleep-optimal-label">7–9h ideal</span>
          </div>

          <input
            type="range"
            className="sleep-slider"
            min={0}
            max={14}
            step={0.5}
            value={hours}
            onChange={handleHoursChange}
            aria-label="Sleep hours"
          />
        </div>

        <div className="sleep-slider-labels">
          <span>0h</span>
          <span>7h</span>
          <span>14h</span>
        </div>
      </div>

      {/* Quality selector */}
      <div className="sleep-quality-section">
        <span className="sleep-quality-label">Sleep Quality</span>
        <div className="sleep-quality-pills">
          {SLEEP_QUALITIES.map((q) => {
            const isActive = quality === q.value;
            return (
              <button
                key={q.value}
                className={`sleep-quality-pill${isActive ? ' sleep-quality-pill--active' : ''}`}
                onClick={() => handleQualityChange(q.value)}
                aria-pressed={isActive}
                style={
                  isActive
                    ? {
                        background: `${q.color}18`,
                        borderColor: `${q.color}60`,
                        boxShadow: `0 0 16px ${q.color}30, inset 0 0 8px ${q.color}10`,
                      }
                    : undefined
                }
              >
                <span>{q.icon}</span>
                <span>{q.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
