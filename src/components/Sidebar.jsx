/**
 * Sidebar — Fixed left navigation for LVL_UP dashboard.
 * 
 * Shows LVL_UP branding, domain nav items with Material Symbols icons,
 * and user profile at the bottom with real auth data + logout.
 */

import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/',        icon: 'grid_view',      label: 'Hub' },
  { path: '/mind',    icon: 'psychology',      label: 'Mind' },
  { path: '/sleep',   icon: 'bedtime',         label: 'Sleep' },
  { path: '/habits',  icon: 'verified_user',   label: 'Habits' },
  { path: '/money',   icon: 'savings',         label: 'Money' },
  { path: '/hobbies', icon: 'palette',         label: 'Hobbies' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const displayName = user?.displayName || user?.username || 'Player';
  const initial = displayName.trim().charAt(0).toUpperCase() || '🙂';

  return (
    <aside className="sidebar">
      {/* Branding */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
        </div>
        <span className="sidebar__title">LVL_UP</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ path, icon, label }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            className={({ isActive }) =>
              `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
            }
          >
            <span
              className="material-symbols-outlined sidebar__link-icon"
            >
              {icon}
            </span>
            <span className="sidebar__link-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Profile */}
      <div className="sidebar__footer">
        <div className="sidebar__user">
          <div className="sidebar__avatar">
            <span>{initial}</span>
          </div>
          <div className="sidebar__user-info">
            <p className="sidebar__user-name">{displayName}</p>
            <p className="sidebar__user-rank">{user?.tier || 'Starter'} Tier</p>
          </div>
        </div>
        <button className="sidebar__exit-btn" onClick={logout}>
          <span className="material-symbols-outlined">logout</span>
          <span className="sidebar__exit-label">Logout</span>
        </button>
      </div>
    </aside>
  );
}
