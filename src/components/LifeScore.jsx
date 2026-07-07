/**
 * LifeScore — Animated circular score display.
 *
 * Shows a large 0-100 number with an SVG progress ring that
 * color-shifts by score level. Counter animates on mount and
 * value changes. Hover reveals a domain-breakdown tooltip.
 */

import { useState, useEffect, useRef } from 'react';
import { getScoreColor, getScoreLabel } from '../utils/scoring.js';
import './LifeScore.css';

const CIRCLE_R = 60;
const CIRCLE_CX = 70;
const CIRCLE_CY = 70;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R; // ≈ 376.99

const DOMAIN_META = [
  { key: 'mood',    label: 'Mood',    colorClass: 'mood' },
  { key: 'sleep',   label: 'Sleep',   colorClass: 'sleep' },
  { key: 'habits',  label: 'Habits',  colorClass: 'habits' },
  { key: 'hobbies', label: 'Hobbies', colorClass: 'hobbies' },
  { key: 'budget',  label: 'Budget',  colorClass: 'budget' },
];

export default function LifeScore({ score }) {
  const total = score?.total ?? 0;
  const breakdown = score?.breakdown ?? {};

  const [displayValue, setDisplayValue] = useState(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const prevTotalRef = useRef(0);
  const rafRef = useRef(null);

  // Animate counter from previous value to current value
  useEffect(() => {
    const from = prevTotalRef.current;
    const to = total;
    prevTotalRef.current = total;

    if (from === to) {
      setDisplayValue(to);
      return;
    }

    // Trigger pulse animation
    setIsPulsing(true);
    const pulseTimer = setTimeout(() => setIsPulsing(false), 650);

    const duration = 800; // ms
    let startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      setDisplayValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(pulseTimer);
    };
  }, [total]);

  const scoreColor = getScoreColor(total);
  const scoreLabel = getScoreLabel(total);
  const dashOffset = CIRCUMFERENCE * (1 - total / 100);

  return (
    <section className="life-score" aria-label="Life Score">
      <div className="life-score__ring">
        <svg viewBox={`0 0 ${CIRCLE_CX * 2} ${CIRCLE_CY * 2}`}>
          {/* Track */}
          <circle
            cx={CIRCLE_CX}
            cy={CIRCLE_CY}
            r={CIRCLE_R}
            className="life-score__track"
          />
          {/* Progress */}
          <circle
            cx={CIRCLE_CX}
            cy={CIRCLE_CY}
            r={CIRCLE_R}
            className="life-score__progress"
            style={{
              stroke: scoreColor,
              strokeDasharray: CIRCUMFERENCE,
              strokeDashoffset: dashOffset,
            }}
          />
        </svg>

        {/* Centered number */}
        <div className="life-score__value-container">
          <span
            className={`life-score__number ${isPulsing ? 'life-score__number--pulse' : ''}`}
            style={{ color: scoreColor }}
          >
            {displayValue}
          </span>
          <span className="life-score__of">of 100</span>
        </div>

        {/* Hover breakdown tooltip */}
        <div className="life-score__breakdown" role="tooltip">
          <div className="life-score__breakdown-title">Score Breakdown</div>
          {DOMAIN_META.map(({ key, label, colorClass }) => {
            const val = breakdown[key] ?? 0;
            return (
              <div key={key} className="life-score__breakdown-row">
                <span className="life-score__breakdown-label">{label}</span>
                <div className="life-score__breakdown-bar-track">
                  <div
                    className={`life-score__breakdown-bar-fill life-score__breakdown-bar--${colorClass}`}
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className={`life-score__breakdown-value life-score__breakdown-value--${colorClass}`}>
                  {Math.round(val)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Label */}
      <span className="life-score__label" style={{ color: scoreColor }}>
        {scoreLabel}
      </span>
    </section>
  );
}
