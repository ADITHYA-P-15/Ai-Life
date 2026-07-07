/**
 * TopBar — Fixed top application bar for LVL_UP.
 *
 * Shows the current page title (dynamic based on route),
 * Life Score badge, notification & settings buttons.
 */

import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useDailyLog } from '../hooks/useDailyLog';
import './TopBar.css';

const PAGE_TITLES = {
  '/': 'HUB',
  '/mind': 'NEURAL DASHBOARD',
  '/sleep': 'SLEEP_RECOVERY',
  '/habits': 'HABIT_PROTOCOL',
  '/money': 'CAPITAL HUB',
  '/hobbies': 'CREATIVE_MATRIX',
};

export default function TopBar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { lifeScore, todayLog, habits, hobbies, todayExpenses, settings, saveSettings, clearTodayLog } = useDailyLog();
  const [activePanel, setActivePanel] = useState(null);
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [savingSettings, setSavingSettings] = useState(false);
  const [clearing, setClearing] = useState(false);
  const title = PAGE_TITLES[location.pathname] || 'HUB';

  // Domain color for the title
  const titleColorMap = {
    '/': 'var(--primary)',
    '/mind': 'var(--domain-mind)',
    '/sleep': 'var(--domain-sleep)',
    '/habits': 'var(--domain-habits)',
    '/money': 'var(--domain-money)',
    '/hobbies': 'var(--domain-hobbies)',
  };
  const titleColor = titleColorMap[location.pathname] || 'var(--primary)';
  const panelOpen = (name) => activePanel === name;

  const notifications = useMemo(() => {
    const items = [];
    if (!todayLog.hasLog) {
      items.push({ icon: 'edit_note', title: 'Start today fresh', body: 'No real check-in has been logged yet.' });
    }
    if (habits.length === 0) {
      items.push({ icon: 'add_task', title: 'No habits yet', body: 'Create one tiny ritual to begin streak tracking.' });
    }
    if (hobbies.length === 0) {
      items.push({ icon: 'palette', title: 'No hobbies yet', body: 'Add a creative skill to track flow time.' });
    }
    if (todayExpenses > settings.dailyBudgetTarget) {
      items.push({ icon: 'payments', title: 'Budget crossed', body: `Today is ₹${Math.round(todayExpenses - settings.dailyBudgetTarget).toLocaleString('en-IN')} over target.` });
    }
    if (items.length === 0) {
      items.push({ icon: 'check_circle', title: 'All quiet', body: 'Your dashboard has no urgent nudges right now.' });
    }
    return items;
  }, [todayLog.hasLog, habits.length, hobbies.length, todayExpenses, settings.dailyBudgetTarget]);
  const hasActionableNotifications = notifications.some((item) => item.title !== 'All quiet');

  const handlePanelToggle = (name) => {
    setSettingsDraft(settings);
    setActivePanel((current) => current === name ? null : name);
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await saveSettings({
        monthlyBudget: Number(settingsDraft.monthlyBudget) || settings.monthlyBudget,
        dailyBudgetTarget: Number(settingsDraft.dailyBudgetTarget) || settings.dailyBudgetTarget,
        hobbyTarget: Number(settingsDraft.hobbyTarget) || settings.hobbyTarget,
      });
      setActivePanel(null);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleClearToday = async () => {
    const confirmed = window.confirm('Clear all of today’s mood, sleep, habits, expenses, hobbies, and cached AI insight?');
    if (!confirmed) return;
    setClearing(true);
    try {
      await clearTodayLog();
      setActivePanel(null);
    } finally {
      setClearing(false);
    }
  };

  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title" style={{ color: titleColor }}>{title}</h1>
      </div>
      <div className="topbar__right">
        <div className="topbar__score-badge">
          <span className="material-symbols-outlined topbar__score-icon" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="topbar__score-text">Life Score: {lifeScore.total}</span>
        </div>
        <div className="topbar__actions">
          <button className={`btn-icon ${panelOpen('notifications') ? 'topbar__icon-active' : ''}`} aria-label="Notifications" onClick={() => handlePanelToggle('notifications')}>
            <span className="material-symbols-outlined">notifications</span>
            {hasActionableNotifications && <span className="topbar__notify-dot" />}
          </button>
          <button className={`btn-icon ${panelOpen('settings') ? 'topbar__icon-active' : ''}`} aria-label="Settings" onClick={() => handlePanelToggle('settings')}>
            <span className="material-symbols-outlined">settings</span>
          </button>
        </div>
      </div>

      {panelOpen('notifications') && (
        <div className="topbar__panel topbar__panel--notifications">
          <div className="topbar__panel-header">
            <h3>Notifications</h3>
            <button className="btn-icon" onClick={() => setActivePanel(null)} aria-label="Close notifications">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="topbar__notice-list">
            {notifications.map((item) => (
              <div key={`${item.icon}-${item.title}`} className="topbar__notice-item">
                <span className="material-symbols-outlined">{item.icon}</span>
                <div>
                  <p>{item.title}</p>
                  <span>{item.body}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {panelOpen('settings') && (
        <div className="topbar__panel topbar__panel--settings">
          <div className="topbar__panel-header">
            <div>
              <h3>Settings</h3>
              <p>{user?.displayName || user?.username || 'Profile'}</p>
            </div>
            <button className="btn-icon" onClick={() => setActivePanel(null)} aria-label="Close settings">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <label className="topbar__setting-row">
            <span>Daily budget</span>
            <input type="number" min="0" value={settingsDraft.dailyBudgetTarget || ''} onChange={(e) => setSettingsDraft(prev => ({ ...prev, dailyBudgetTarget: e.target.value }))} />
          </label>
          <label className="topbar__setting-row">
            <span>Monthly budget</span>
            <input type="number" min="0" value={settingsDraft.monthlyBudget || ''} onChange={(e) => setSettingsDraft(prev => ({ ...prev, monthlyBudget: e.target.value }))} />
          </label>
          <label className="topbar__setting-row">
            <span>Hobby target</span>
            <input type="number" min="0" value={settingsDraft.hobbyTarget || ''} onChange={(e) => setSettingsDraft(prev => ({ ...prev, hobbyTarget: e.target.value }))} />
          </label>

          <div className="topbar__panel-actions">
            <button className="btn-primary topbar__save-btn" onClick={handleSaveSettings} disabled={savingSettings}>
              {savingSettings ? 'Saving...' : 'Save settings'}
            </button>
            <button className="topbar__danger-btn" onClick={handleClearToday} disabled={clearing}>
              {clearing ? 'Clearing...' : 'Clear today'}
            </button>
            <button className="topbar__logout-btn" onClick={logout}>Log out</button>
          </div>
        </div>
      )}
    </header>
  );
}
