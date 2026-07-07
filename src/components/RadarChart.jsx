/**
 * RadarChart — Custom SVG pentagon radar chart (the "pulse").
 *
 * Displays five life domains as axes on a pentagon, with concentric
 * grid levels and a gradient-filled data polygon. Supports animated
 * transitions on value changes and an optional ghost outline for the
 * previous day's values.
 */

import { useMemo } from 'react';
import './RadarChart.css';

const CX = 150;
const CY = 150;
const RADIUS = 120;
const LEVELS = [25, 50, 75, 100];

const DOMAINS = [
  { key: 'mood',    label: 'Mind',    icon: '⚡', color: '#00E5FF' },
  { key: 'sleep',   label: 'Sleep',   icon: '🌙', color: '#cdc0e9' },
  { key: 'habits',  label: 'Habits',  icon: '🛡️', color: '#10b981' },
  { key: 'money',   label: 'Money',   icon: '💎', color: '#10b981' },
  { key: 'hobbies', label: 'Hobbies', icon: '🎨', color: '#FF4DFF' },
];

/**
 * Compute (x, y) for axis i at a given fraction (0–1) of the radius.
 * Axis 0 points straight up (angle = -π/2).
 */
function getPoint(axisIndex, fraction) {
  const angle = (axisIndex * 2 * Math.PI) / 5 - Math.PI / 2;
  return {
    x: CX + RADIUS * fraction * Math.cos(angle),
    y: CY + RADIUS * fraction * Math.sin(angle),
  };
}

/** Build polygon "points" attribute string from a set of fractional values. */
function buildPolygonPoints(values) {
  return DOMAINS.map((d, i) => {
    const fraction = Math.max(0, Math.min(1, (values[d.key] || 0) / 100));
    const pt = getPoint(i, fraction);
    return `${pt.x},${pt.y}`;
  }).join(' ');
}

/** Build a closed polygon path for a grid level (fraction of radius). */
function buildGridPoints(fraction) {
  return Array.from({ length: 5 }, (_, i) => {
    const pt = getPoint(i, fraction);
    return `${pt.x},${pt.y}`;
  }).join(' ');
}

export default function RadarChart({ values = {}, previousValues }) {
  // Memoize expensive point calculations
  const gridPolygons = useMemo(
    () => LEVELS.map((lvl) => buildGridPoints(lvl / 100)),
    []
  );

  const axisEndpoints = useMemo(
    () => DOMAINS.map((_, i) => getPoint(i, 1)),
    []
  );

  const dataPoints = useMemo(
    () => buildPolygonPoints(values),
    [values]
  );

  const dataDots = useMemo(
    () =>
      DOMAINS.map((d, i) => {
        const fraction = Math.max(0, Math.min(1, (values[d.key] || 0) / 100));
        return getPoint(i, fraction);
      }),
    [values]
  );

  const ghostPoints = useMemo(
    () => (previousValues ? buildPolygonPoints(previousValues) : null),
    [previousValues]
  );

  // Label positioning: push labels further out from the chart
  const labelPositions = useMemo(
    () =>
      DOMAINS.map((_, i) => {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        const labelRadius = RADIUS + 30;
        return {
          x: CX + labelRadius * Math.cos(angle),
          y: CY + labelRadius * Math.sin(angle),
        };
      }),
    []
  );

  return (
    <figure className="radar-chart" role="img" aria-label="Life domains radar chart">
      <svg viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">
        {/* Defs: gradient + glow filters */}
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cfbcff" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#6750a4" stopOpacity="0.15" />
          </linearGradient>

          <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0  0 0.83 0 0 0  0 0 1 0 0  0 0 0 0.4 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="radarGlowStrong" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              type="matrix"
              values="0 0 0 0 0  0 0.83 0 0 0  0 0 1 0 0  0 0 0 0.6 0"
              result="coloredBlur"
            />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid: concentric pentagon levels */}
        {gridPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            className={`radar-grid-line ${idx === gridPolygons.length - 1 ? 'radar-grid-line--outer' : ''}`}
          />
        ))}

        {/* Axis spokes */}
        {axisEndpoints.map((ep, i) => (
          <line
            key={i}
            x1={CX}
            y1={CY}
            x2={ep.x}
            y2={ep.y}
            className="radar-axis-line"
          />
        ))}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={2} className="radar-center-dot" />

        {/* Ghost polygon (previous day) */}
        {ghostPoints && (
          <polygon points={ghostPoints} className="radar-ghost-polygon" />
        )}

        {/* Data polygon */}
        <polygon points={dataPoints} className="radar-data-polygon" />

        {/* Data point dots */}
        {dataDots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={3.5}
            className="radar-data-dot"
          />
        ))}

        {/* Axis labels */}
        {DOMAINS.map((domain, i) => {
          const pos = labelPositions[i];
          // Shift the value text below the label
          const isTop = i === 0;
          const iconOffset = isTop ? -12 : -10;
          const nameOffset = isTop ? 2 : 3;
          const valueOffset = isTop ? 14 : 15;

          return (
            <g
              key={domain.key}
              className={`radar-label-group radar-label--${domain.key}`}
            >
              <text x={pos.x} y={pos.y + iconOffset} className="radar-label-icon">
                {domain.icon}
              </text>
              <text x={pos.x} y={pos.y + nameOffset} className="radar-label-name">
                {domain.label}
              </text>
              <text x={pos.x} y={pos.y + valueOffset} className="radar-label-value">
                {Math.round(values[domain.key] || 0)}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
