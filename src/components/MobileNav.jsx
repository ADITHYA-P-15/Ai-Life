/**
 * MobileNav — Floating pill-shaped bottom navigation for mobile.
 * Hidden on desktop where the sidebar is visible.
 */

import { NavLink, useLocation } from 'react-router-dom';
import './MobileNav.css';

const NAV_ITEMS = [
  { path: '/',        icon: 'grid_view',      label: 'Hub' },
  { path: '/mind',    icon: 'psychology',      label: 'Mind' },
  { path: '/sleep',   icon: 'bedtime',         label: 'Sleep' },
  { path: '/habits',  icon: 'verified_user',   label: 'Habits' },
  { path: '/money',   icon: 'savings',         label: 'Money' },
  { path: '/hobbies', icon: 'palette',         label: 'Hobbies' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {NAV_ITEMS.map(({ path, icon, label }) => {
        const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
        return (
          <NavLink
            key={path}
            to={path}
            className={`mobile-nav__item ${isActive ? 'mobile-nav__item--active' : ''}`}
            aria-label={label}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {icon}
            </span>
          </NavLink>
        );
      })}
    </nav>
  );
}
