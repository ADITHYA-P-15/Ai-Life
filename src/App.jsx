/**
 * App.jsx — Root component with auth-aware routing.
 *
 * Unauthenticated: shows Login/Register
 * Authenticated: shows AppShell with domain pages
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import AppShell from './components/AppShell';
import HubPage from './pages/HubPage';
import MindPage from './pages/MindPage';
import SleepPage from './pages/SleepPage';
import HabitsPage from './pages/HabitsPage';
import MoneyPage from './pages/MoneyPage';
import HobbiesPage from './pages/HobbiesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

/** Route guard: redirects to /login if not authenticated */
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
        <p className="app-loading__text">Initializing LVL_UP...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Route guard: redirects to / if already authenticated */
function GuestRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="app-loading__spinner" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

      {/* Protected routes */}
      <Route element={
        <ProtectedRoute>
          <AppProvider>
            <AppShell />
          </AppProvider>
        </ProtectedRoute>
      }>
        <Route index element={<HubPage />} />
        <Route path="mind" element={<MindPage />} />
        <Route path="sleep" element={<SleepPage />} />
        <Route path="habits" element={<HabitsPage />} />
        <Route path="money" element={<MoneyPage />} />
        <Route path="hobbies" element={<HobbiesPage />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
