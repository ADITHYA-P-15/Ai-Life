/**
 * DomainMascot - Polished domain avatars for hero art and hub chips.
 */
import { useId } from 'react';
import { MASCOT_LABELS } from '../assets/images';
import './DomainMascot.css';

const DOMAIN_ACCENTS = {
  mind: {
    glow: 'rgba(0, 229, 255, 0.55)',
    ring: 'rgba(0, 229, 255, 0.28)',
  },
  sleep: {
    glow: 'rgba(205, 192, 233, 0.5)',
    ring: 'rgba(205, 192, 233, 0.26)',
  },
  habits: {
    glow: 'rgba(16, 185, 129, 0.55)',
    ring: 'rgba(16, 185, 129, 0.28)',
  },
  money: {
    glow: 'rgba(245, 200, 75, 0.52)',
    ring: 'rgba(245, 200, 75, 0.28)',
  },
  hobbies: {
    glow: 'rgba(255, 77, 255, 0.5)',
    ring: 'rgba(255, 77, 255, 0.26)',
  },
};

function MascotDefs({ ids, colors }) {
  return (
    <defs>
      <filter id={ids.shadow} x="-45%" y="-45%" width="190%" height="190%">
        <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="#000" floodOpacity="0.34" />
        <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor={colors.glow} floodOpacity="0.72" />
      </filter>
      <radialGradient id={ids.glow} cx="50%" cy="42%" r="58%">
        <stop offset="0%" stopColor={colors.glow} stopOpacity="0.5" />
        <stop offset="72%" stopColor={colors.glow} stopOpacity="0.08" />
        <stop offset="100%" stopColor={colors.glow} stopOpacity="0" />
      </radialGradient>
      <linearGradient id={ids.primary} x1="18%" y1="10%" x2="82%" y2="90%">
        <stop offset="0%" stopColor={colors.light} />
        <stop offset="46%" stopColor={colors.mid} />
        <stop offset="100%" stopColor={colors.dark} />
      </linearGradient>
      <linearGradient id={ids.shine} x1="18%" y1="0%" x2="78%" y2="100%">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.72" />
        <stop offset="48%" stopColor="#fff" stopOpacity="0.16" />
        <stop offset="100%" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={ids.warm} x1="12%" y1="18%" x2="92%" y2="88%">
        <stop offset="0%" stopColor={colors.warmLight || colors.light} />
        <stop offset="52%" stopColor={colors.warmMid || colors.mid} />
        <stop offset="100%" stopColor={colors.warmDark || colors.dark} />
      </linearGradient>
    </defs>
  );
}

function Face({ x = 75, y = 86, mood = 'smile' }) {
  return (
    <g>
      <circle cx={x} cy={y} r="9" fill="#141218" opacity="0.88" />
      <circle cx={x + 2.8} cy={y - 3} r="3.2" fill="#fff" opacity="0.86" />
      <circle cx={x + 50} cy={y} r="9" fill="#141218" opacity="0.88" />
      <circle cx={x + 52.8} cy={y - 3} r="3.2" fill="#fff" opacity="0.86" />
      {mood === 'sleep' ? (
        <>
          <path d={`M${x - 7} ${y + 1} q8 8 16 0`} fill="none" stroke="#5c5074" strokeWidth="4" strokeLinecap="round" />
          <path d={`M${x + 43} ${y + 1} q8 8 16 0`} fill="none" stroke="#5c5074" strokeWidth="4" strokeLinecap="round" />
          <path d={`M${x + 23} ${y + 33} q8 5 18 0`} fill="none" stroke="#5c5074" strokeWidth="4" strokeLinecap="round" />
        </>
      ) : (
        <path d={`M${x + 20} ${y + 33} q16 13 36 0`} fill="none" stroke="#141218" strokeWidth="5" strokeLinecap="round" opacity="0.72" />
      )}
    </g>
  );
}

function MindMascot({ ids }) {
  return (
    <svg className="domain-mascot__svg" viewBox="0 0 200 200" aria-hidden="true">
      <MascotDefs ids={ids} colors={{ glow: '#00e5ff', light: '#b6f7ff', mid: '#34d3ee', dark: '#1677a1' }} />
      <ellipse cx="100" cy="160" rx="48" ry="12" fill={`url(#${ids.glow})`} opacity="0.5" />
      <g filter={`url(#${ids.shadow})`}>
        <path d="M61 127 h78 v22 c0 12 -10 22 -22 22 H83 c-12 0 -22 -10 -22 -22z" fill="#173044" />
        <path d="M72 146 h56" stroke="#7eeaff" strokeWidth="6" strokeLinecap="round" opacity="0.5" />
        <path d="M72 65 c1 -25 21 -41 47 -37 c24 4 41 25 37 50 c16 9 22 29 10 45 c-8 12 -20 17 -35 15 H72 c-19 0 -35 -14 -36 -33 c-1 -18 9 -32 26 -40z" fill={`url(#${ids.primary})`} />
        <path d="M73 70 c10 -18 29 -24 48 -17 c17 7 28 24 25 44 c11 4 18 14 18 25" fill="none" stroke={`url(#${ids.shine})`} strokeWidth="8" strokeLinecap="round" opacity="0.72" />
        <path d="M77 84 c6 -14 23 -17 34 -7 c10 -15 34 -8 34 11 c14 3 18 20 8 29" fill="none" stroke="#0f4f70" strokeWidth="7" strokeLinecap="round" opacity="0.34" />
        <path d="M100 56 v70 M70 98 h61 M91 72 c-12 8 -15 23 -7 35 M124 76 c11 8 13 23 3 35" fill="none" stroke="#d8fbff" strokeWidth="4" strokeLinecap="round" opacity="0.46" />
        <circle cx="77" cy="151" r="9" fill="#86f4ff" opacity="0.82" />
        <circle cx="123" cy="151" r="9" fill="#86f4ff" opacity="0.82" />
        <path d="M75 176 h17 M108 176 h17" stroke="#8eeaff" strokeWidth="8" strokeLinecap="round" />
        <Face x={75} y={96} />
      </g>
    </svg>
  );
}

function SleepMascot({ ids }) {
  return (
    <svg className="domain-mascot__svg" viewBox="0 0 200 200" aria-hidden="true">
      <MascotDefs ids={ids} colors={{ glow: '#cdc0e9', light: '#f0eaff', mid: '#b9a6e6', dark: '#6d5a9c' }} />
      <ellipse cx="101" cy="160" rx="54" ry="13" fill={`url(#${ids.glow})`} opacity="0.56" />
      <g filter={`url(#${ids.shadow})`}>
        <path d="M136 51 c10 3 18 12 20 24 c-12 -6 -24 -7 -35 -2 c2 -11 7 -18 15 -22z" fill={`url(#${ids.primary})`} />
        <circle cx="157" cy="78" r="7" fill="#efe8ff" />
        <path d="M54 106 c-18 0 -30 -13 -30 -29 c0 -16 13 -29 31 -29 c7 -19 24 -30 44 -30 c23 0 41 14 46 36 c20 1 33 15 33 33 c0 19 -15 34 -36 34 H60 c-2 0 -4 0 -6 -1z" fill={`url(#${ids.primary})`} />
        <path d="M58 61 c17 -24 57 -24 75 5 c15 -2 26 2 34 12" fill="none" stroke={`url(#${ids.shine})`} strokeWidth="9" strokeLinecap="round" opacity="0.66" />
        <path d="M45 125 c4 19 18 32 34 28 c11 24 41 23 51 0 c18 4 33 -10 37 -31" fill={`url(#${ids.primary})`} opacity="0.96" />
        <Face x={74} y={89} mood="sleep" />
      </g>
    </svg>
  );
}

function HabitsMascot({ ids }) {
  return (
    <svg className="domain-mascot__svg" viewBox="0 0 200 200" aria-hidden="true">
      <MascotDefs ids={ids} colors={{ glow: '#10b981', light: '#72f2bc', mid: '#10b981', dark: '#07624a' }} />
      <ellipse cx="100" cy="163" rx="50" ry="12" fill={`url(#${ids.glow})`} opacity="0.6" />
      <g filter={`url(#${ids.shadow})`}>
        <path d="M100 22 l61 24 v48 c0 41 -23 70 -61 86 c-38 -16 -61 -45 -61 -86 V46z" fill="#063729" opacity="0.9" />
        <path d="M100 29 l51 20 v43 c0 34 -18 59 -51 75 c-33 -16 -51 -41 -51 -75 V49z" fill={`url(#${ids.primary})`} />
        <path d="M100 42 v110 c25 -14 38 -34 38 -61 V58z" fill="#07291f" opacity="0.24" />
        <path d="M63 61 l37 -15 l37 15 v31 c0 24 -13 43 -37 55 c-24 -12 -37 -31 -37 -55z" fill="none" stroke="#95ffd0" strokeWidth="4" opacity="0.52" />
        <path d="M74 95 l17 17 l37 -43" fill="none" stroke="#dcfff0" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.84" />
        <path d="M62 56 c26 -16 56 -17 83 -1" fill="none" stroke={`url(#${ids.shine})`} strokeWidth="8" strokeLinecap="round" opacity="0.62" />
        <Face x={71} y={102} />
      </g>
    </svg>
  );
}

function MoneyMascot({ ids }) {
  return (
    <svg className="domain-mascot__svg" viewBox="0 0 200 200" aria-hidden="true">
      <MascotDefs
        ids={ids}
        colors={{
          glow: '#f5c84b',
          light: '#fff2a6',
          mid: '#f5c84b',
          dark: '#b87217',
          warmLight: '#ffe99b',
          warmMid: '#eab833',
          warmDark: '#986214',
        }}
      />
      <ellipse cx="100" cy="162" rx="56" ry="13" fill={`url(#${ids.glow})`} opacity="0.58" />
      <g filter={`url(#${ids.shadow})`}>
        <circle cx="78" cy="72" r="18" fill={`url(#${ids.warm})`} />
        <circle cx="130" cy="72" r="18" fill={`url(#${ids.warm})`} />
        <path d="M50 103 c0 -34 28 -57 63 -53 c28 3 51 24 53 52 c1 34 -26 57 -63 57 c-32 0 -53 -22 -53 -56z" fill={`url(#${ids.primary})`} />
        <path d="M144 96 c19 -3 31 7 30 21 c-1 13 -11 22 -26 22 h-16 v-38z" fill={`url(#${ids.warm})`} />
        <circle cx="166" cy="118" r="6" fill="#6d4312" opacity="0.58" />
        <path d="M67 67 c22 -18 64 -16 83 12" fill="none" stroke={`url(#${ids.shine})`} strokeWidth="9" strokeLinecap="round" opacity="0.74" />
        <path d="M88 86 h35 M88 98 h30 M91 86 c24 0 28 17 8 24 l-10 4 l28 28" fill="none" stroke="#fff2aa" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.72" />
        <path d="M82 82 c18 -8 42 -7 56 4" fill="none" stroke="#7a5013" strokeWidth="5" strokeLinecap="round" opacity="0.2" />
        <circle cx="79" cy="111" r="8" fill="#2c2111" opacity="0.82" />
        <circle cx="82" cy="108" r="3" fill="#fff" opacity="0.82" />
        <circle cx="130" cy="111" r="8" fill="#2c2111" opacity="0.82" />
        <circle cx="133" cy="108" r="3" fill="#fff" opacity="0.82" />
        <path d="M94 136 q14 9 29 0" fill="none" stroke="#4c3312" strokeWidth="5" strokeLinecap="round" opacity="0.72" />
        <path d="M70 163 h18 M119 163 h18" stroke="#f8d66a" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

function HobbiesMascot({ ids }) {
  return (
    <svg className="domain-mascot__svg" viewBox="0 0 200 200" aria-hidden="true">
      <MascotDefs ids={ids} colors={{ glow: '#ff4dff', light: '#ffb3ff', mid: '#d946ef', dark: '#86198f' }} />
      <ellipse cx="100" cy="163" rx="52" ry="13" fill={`url(#${ids.glow})`} opacity="0.58" />
      <g filter={`url(#${ids.shadow})`}>
        <path d="M82 61 c5 -28 25 -42 51 -43 c-8 13 -7 25 4 38 c13 16 13 38 -1 54 c-14 15 -40 16 -54 0 c-12 -13 -14 -31 0 -49z" fill={`url(#${ids.primary})`} />
        <path d="M83 92 h57 v43 c0 18 -13 31 -31 31 h-2 c-17 0 -31 -13 -31 -31 V99 c0 -4 3 -7 7 -7z" fill={`url(#${ids.primary})`} />
        <path d="M92 48 c13 -15 28 -20 45 -21 c-8 8 -12 20 -8 34" fill="none" stroke={`url(#${ids.shine})`} strokeWidth="8" strokeLinecap="round" opacity="0.62" />
        <path d="M145 111 l30 -37 c5 -6 14 -6 19 -1 c5 5 5 13 0 18 l-38 31z" fill="#f2dc8b" />
        <path d="M153 119 l-15 14 l-8 -9 l15 -13z" fill="#7c3aed" />
        <path d="M52 119 c16 -16 39 -15 54 2 c13 14 11 35 -4 46 c-17 12 -43 6 -55 -13 c-7 -12 -5 -25 5 -35z" fill="#2a2034" stroke="#ffb3ff" strokeWidth="4" opacity="0.95" />
        <circle cx="66" cy="137" r="6" fill="#00e5ff" />
        <circle cx="82" cy="130" r="6" fill="#f5c84b" />
        <circle cx="91" cy="148" r="6" fill="#10b981" />
        <Face x={83} y={105} />
        <path d="M72 170 h17 M119 170 h17" stroke="#ff92ff" strokeWidth="8" strokeLinecap="round" />
      </g>
    </svg>
  );
}

const MASCOTS = {
  mind: MindMascot,
  sleep: SleepMascot,
  habits: HabitsMascot,
  money: MoneyMascot,
  hobbies: HobbiesMascot,
};

export default function DomainMascot({
  domain,
  size = 80,
  delay = 0,
  float = true,
  variant = 'chip',
  className = '',
  alt,
}) {
  const rawId = useId().replace(/:/g, '');
  const Mascot = MASCOTS[domain];
  const accent = DOMAIN_ACCENTS[domain];

  if (!Mascot || !accent) return null;

  const ids = {
    shadow: `mascot-${rawId}-${domain}-shadow`,
    glow: `mascot-${rawId}-${domain}-glow`,
    primary: `mascot-${rawId}-${domain}-primary`,
    shine: `mascot-${rawId}-${domain}-shine`,
    warm: `mascot-${rawId}-${domain}-warm`,
  };
  const floatClass = float
    ? variant === 'cloud'
      ? 'animate-cloud-float'
      : 'animate-float'
    : '';

  return (
    <div
      className={`domain-mascot domain-mascot--vector domain-mascot--${domain} domain-mascot--${variant} ${floatClass} ${className}`}
      style={{
        width: size,
        height: size,
        animationDelay: `${delay}s`,
        '--mascot-glow-color': accent.glow,
        '--mascot-ring': accent.ring,
      }}
      role="img"
      aria-label={alt || MASCOT_LABELS[domain] || 'Domain mascot'}
    >
      <div className="domain-mascot__viewport">
        <Mascot ids={ids} />
      </div>
    </div>
  );
}
