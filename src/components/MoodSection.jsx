import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MOOD_EMOJIS, MOOD_LABELS } from '../utils/categories.js';
import './MoodSection.css';

/**
 * Interpolates between red and green based on a 1-10 score.
 * Returns an HSL color string.
 */
function getMoodColor(score) {
  // Hue: 0 (red) → 30 (orange) → 60 (yellow) → 120 (green)
  const hue = ((score - 1) / 9) * 120;
  return `hsl(${hue}, 75%, 50%)`;
}

function getMoodGlow(score) {
  const hue = ((score - 1) / 9) * 120;
  return `0 0 14px hsla(${hue}, 75%, 50%, 0.5)`;
}

export default function MoodSection() {
  const { state, dispatch } = useApp();
  const score = state.todayLog.mood.score;
  const note = state.todayLog.mood.note;

  const [bouncing, setBouncing] = useState(false);
  const prevScore = useRef(score);

  // Trigger bounce animation on score change
  useEffect(() => {
    if (prevScore.current !== score) {
      setBouncing(true);
      prevScore.current = score;
      const timer = setTimeout(() => setBouncing(false), 500);
      return () => clearTimeout(timer);
    }
  }, [score]);

  const handleScoreChange = (e) => {
    dispatch({ type: 'SET_MOOD', payload: { score: Number(e.target.value) } });
  };

  const handleNoteChange = (e) => {
    dispatch({ type: 'SET_MOOD', payload: { note: e.target.value } });
  };

  const fillPercent = ((score - 1) / 9) * 100;
  const thumbColor = getMoodColor(score);
  const thumbGlow = getMoodGlow(score);

  // Build the gradient fill for the track
  const fillGradient = `linear-gradient(90deg, hsl(0, 75%, 50%) 0%, hsl(60, 75%, 50%) 50%, hsl(120, 75%, 50%) 100%)`;

  return (
    <section className="mood-section glass-card">
      {/* Header */}
      <header className="mood-header">
        <div className="mood-header-icon">🎭</div>
        <h3 className="mood-header-title">Mood</h3>
        <span className="mood-header-score">{score}/10</span>
      </header>

      {/* Emoji + Label */}
      <div className="mood-emoji-container">
        <span
          className={`mood-emoji${bouncing ? ' mood-emoji--bounce' : ''}`}
          role="img"
          aria-label={MOOD_LABELS[score]}
        >
          {MOOD_EMOJIS[score]}
        </span>
        <span className="mood-label" style={{ color: thumbColor }}>
          {MOOD_LABELS[score]}
        </span>
      </div>

      {/* Slider */}
      <div className="mood-slider-wrapper">
        <div className="mood-slider-track">
          <div className="mood-slider-bg">
            <div
              className="mood-slider-fill"
              style={{
                width: `${fillPercent}%`,
                background: fillGradient,
              }}
            />
          </div>
          <input
            type="range"
            className="mood-slider"
            min={1}
            max={10}
            step={1}
            value={score}
            onChange={handleScoreChange}
            aria-label="Mood score"
            style={{
              '--thumb-color': thumbColor,
              '--thumb-glow': thumbGlow,
            }}
          />
        </div>
        <div className="mood-slider-labels">
          <span>Terrible</span>
          <span>Incredible</span>
        </div>
      </div>

      {/* Note */}
      <textarea
        className="mood-note"
        rows={2}
        placeholder="How are you feeling?"
        value={note}
        onChange={handleNoteChange}
        aria-label="Mood note"
      />

      {/* Inline style to dynamically color the thumb via CSS custom property */}
      <style>{`
        .mood-slider::-webkit-slider-thumb {
          background: ${thumbColor};
          box-shadow: ${thumbGlow};
        }
        .mood-slider::-moz-range-thumb {
          background: ${thumbColor};
          box-shadow: ${thumbGlow};
        }
      `}</style>
    </section>
  );
}
