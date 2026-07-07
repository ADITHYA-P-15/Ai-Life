/**
 * dataService.js — All data API calls for daily logs, habits, expenses, hobbies, settings.
 * 
 * Centralizes every API call needed by AppContext.
 */
import api from './api.js';

// ─────────────── Daily Logs ───────────────
export async function fetchLog(date) {
  return api(`/logs/${date}`);
}

export async function saveLog(date, { mood, sleep }) {
  return api(`/logs/${date}`, {
    method: 'PUT',
    body: JSON.stringify({ mood, sleep }),
  });
}

export async function clearLog(date) {
  return api(`/logs/${date}`, { method: 'DELETE' });
}

export async function fetchHistory(days = 30) {
  return api(`/logs?days=${days}`);
}

// ─────────────── Habits ───────────────
export async function fetchHabits() {
  return api('/habits');
}

export async function createHabit({ name, icon }) {
  return api('/habits', {
    method: 'POST',
    body: JSON.stringify({ name, icon }),
  });
}

export async function deleteHabit(id) {
  return api(`/habits/${id}`, { method: 'DELETE' });
}

export async function completeHabit(habitId, date) {
  return api(`/habits/${habitId}/complete/${date}`, { method: 'POST' });
}

export async function uncompleteHabit(habitId, date) {
  return api(`/habits/${habitId}/complete/${date}`, { method: 'DELETE' });
}

export async function fetchStreaks() {
  return api('/habits/streaks');
}

// ─────────────── Expenses ───────────────
export async function fetchExpenses(date) {
  return api(`/expenses?date=${date}`);
}

export async function addExpenseAPI(expense) {
  return api('/expenses', {
    method: 'POST',
    body: JSON.stringify(expense),
  });
}

export async function deleteExpense(id) {
  return api(`/expenses/${id}`, { method: 'DELETE' });
}

// ─────────────── Hobbies ───────────────
export async function fetchHobbies() {
  return api('/hobbies');
}

export async function createHobby({ name, icon }) {
  return api('/hobbies', {
    method: 'POST',
    body: JSON.stringify({ name, icon }),
  });
}

export async function deleteHobby(id) {
  return api(`/hobbies/${id}`, { method: 'DELETE' });
}

export async function setHobbyTimeAPI(hobbyId, date, minutes) {
  return api(`/hobbies/${hobbyId}/time/${date}`, {
    method: 'PUT',
    body: JSON.stringify({ minutes }),
  });
}

// ─────────────── Settings ───────────────
export async function fetchSettings() {
  return api('/settings');
}

export async function updateSettings(settings) {
  return api('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// ─────────────── Aura Chat ───────────────
export async function sendAuraChat(payload) {
  return api('/chat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ─────────────── AI Insights ───────────────
export async function fetchCachedInsights(date) {
  return api(`/insights/${date}`);
}

export async function generateInsightsAPI(payload) {
  return api('/insights', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
