/**
 * AppShell — Main layout wrapper combining Sidebar + TopBar + content area.
 * Uses React Router's <Outlet /> for page content rendering.
 * Includes atmospheric background gradient blobs and AuraChat.
 */

import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import MobileNav from './MobileNav';
import AuraChat from './AuraChat';
import './AppShell.css';

export default function AppShell() {
  return (
    <div className="app-shell">
      {/* Atmospheric background elements */}
      <div className="app-shell__bg" aria-hidden="true">
        <div className="app-shell__blob app-shell__blob--primary" />
        <div className="app-shell__blob app-shell__blob--tertiary" />
      </div>

      <Sidebar />
      <TopBar />

      <main className="app-shell__main">
        <div className="app-shell__content">
          <Outlet />
        </div>
      </main>

      <MobileNav />
      <AuraChat />
    </div>
  );
}
