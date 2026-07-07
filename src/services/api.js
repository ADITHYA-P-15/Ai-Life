/**
 * api.js — Base API client with JWT token injection.
 * 
 * All service modules import `api` from here to make authenticated requests.
 * Token is stored in localStorage under 'lvl-up-token'.
 */

const BASE_URL = '/api';
const TOKEN_KEY = 'lvl-up-token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * Make an authenticated API request.
 * Automatically injects the JWT Bearer token and handles JSON.
 */
async function api(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — token expired or invalid
  if (response.status === 401) {
    removeToken();
    // Dispatch a custom event so AuthContext can react
    window.dispatchEvent(new CustomEvent('auth:expired'));
    throw new Error('Authentication expired. Please login again.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export default api;
