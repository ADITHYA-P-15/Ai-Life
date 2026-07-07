/**
 * authService.js — Authentication API calls.
 */
import api, { setToken } from './api.js';

export async function registerUser({ username, email, password, displayName }) {
  const data = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password, displayName }),
  });
  setToken(data.token);
  return data;
}

export async function loginUser({ email, password }) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  return data;
}

export async function getMe() {
  return api('/auth/me');
}
