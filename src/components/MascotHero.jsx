/**
 * MascotHero — Floating single domain mascot with ambient glow for hero sections.
 */
import DomainMascot from './DomainMascot';
import './MascotHero.css';

const SIZES = { sm: 160, md: 200, lg: 240, xl: 280 };

const AMBIENT_GLOWS = {
  mind: 'rgba(0, 229, 255, 0.18)',
  sleep: 'rgba(205, 192, 233, 0.2)',
  money: 'rgba(245, 200, 75, 0.16)',
  habits: 'rgba(16, 185, 129, 0.16)',
  hobbies: 'rgba(255, 77, 255, 0.18)',
};

export default function MascotHero({
  domain,
  size = 'md',
  glow,
  float = true,
  variant = 'default',
  className = '',
  alt,
}) {
  const px = typeof size === 'number' ? size : SIZES[size] || SIZES.md;
  const ambient = glow || AMBIENT_GLOWS[domain] || 'rgba(207, 188, 255, 0.15)';
  const mascotVariant = variant === 'cloud' ? 'cloud' : 'hero';

  return (
    <div className={`mascot-hero mascot-hero--${domain} ${className}`} style={{ '--mascot-glow': ambient }}>
      <div className="mascot-hero__ambient" aria-hidden="true" />
      <DomainMascot
        domain={domain}
        size={px}
        float={float}
        variant={mascotVariant}
        alt={alt}
      />
    </div>
  );
}
