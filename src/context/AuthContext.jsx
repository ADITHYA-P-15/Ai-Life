/**
 * AuthContext — Manages JWT authentication state.
 * 
 * Provides: user, isAuthenticated, isLoading, login, register, logout
 * Wraps the entire app. On mount, checks for existing token and validates.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getToken, removeToken } from '../services/api.js';
import { loginUser, registerUser, getMe } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const token = getToken();
    if (token) {
      getMe()
        .then(userData => {
          setUser(userData);
        })
        .catch(() => {
          removeToken();
          setUser(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for auth:expired events from api.js
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
    };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const data = await loginUser({ email, password });
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async ({ username, email, password, displayName }) => {
    const data = await registerUser({ username, email, password, displayName });
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
