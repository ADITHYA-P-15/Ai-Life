import { formatDate, getToday } from '../utils/dates.js';
import './Layout.css';

function Layout({ children }) {
  const today = getToday();
  const formattedDate = formatDate(today, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? 'Good Morning ☀️'
    : hour < 17
      ? 'Good Afternoon 🌤️'
      : 'Good Evening 🌙';

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-header-inner">
          <h1 className="layout-logo">✦ Life Dashboard</h1>
          <div className="layout-header-right">
            <time className="layout-date" dateTime={today}>
              {formattedDate}
            </time>
            <span className="layout-greeting">{greeting}</span>
          </div>
        </div>
        <div className="layout-accent-line" aria-hidden="true" />
      </header>

      <main className="layout-main">
        {children}
      </main>

      <footer className="layout-footer">
        Track<span>·</span>Reflect<span>·</span>Improve
      </footer>
    </div>
  );
}

export default Layout;
