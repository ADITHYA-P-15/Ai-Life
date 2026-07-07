/**
 * StreakBadge — Reusable streak display component.
 *
 * Shows the current streak count with a tier-appropriate emoji and
 * glow effects that intensify with streak length. Hover expands to
 * reveal the tier label and longest streak.
 */

import { useMemo } from 'react';
import { getStreakTier } from '../utils/streaks.js';
import './StreakBadge.css';

export default function StreakBadge({ current = 0, longest = 0, compact = true }) {
  const tier = useMemo(() => getStreakTier(current), [current]);

  const shouldPulse = current >= 7;

  const classNames = [
    'streak-badge',
    `streak-badge--${tier.tier}`,
    shouldPulse ? 'streak-badge--pulsing' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      role="status"
      aria-label={`${current} day streak, ${tier.label} tier. Longest: ${longest} days`}
    >
      <span className="streak-badge__emoji" aria-hidden="true">
        {tier.emoji}
      </span>
      <span className="streak-badge__count">{current}</span>

      {compact && (
        <div className="streak-badge__expanded">
          <span className="streak-badge__divider" aria-hidden="true" />
          <span className="streak-badge__tier-label">{tier.label}</span>
          {longest > 0 && (
            <span className="streak-badge__longest">
              Best: {longest}d
            </span>
          )}
        </div>
      )}
    </div>
  );
}
