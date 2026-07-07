/**
 * Date utility functions for the Life Dashboard.
 * All dates are stored as ISO date strings (YYYY-MM-DD) for consistency.
 */

/**
 * Returns today's date as YYYY-MM-DD string.
 */
export function getToday() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Formats a YYYY-MM-DD string to a human-readable format.
 * @param {string} dateStr - ISO date string
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date
 */
export function formatDate(dateStr, options = {}) {
  const defaults = { weekday: 'short', month: 'short', day: 'numeric' };
  const merged = { ...defaults, ...options };
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', merged);
}

/**
 * Formats a date to a short display format (e.g., "Mon 23").
 */
export function formatShort(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.toLocaleDateString('en-US', { weekday: 'short' });
  return `${day} ${d.getDate()}`;
}

/**
 * Returns an array of date strings for the last N days (including today).
 * @param {number} n - Number of days
 * @returns {string[]} Array of YYYY-MM-DD strings, oldest first
 */
export function getLastNDays(n = 7) {
  const days = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

/**
 * Returns the start and end dates of the current week (Mon–Sun).
 * @returns {{ start: string, end: string }}
 */
export function getWeekRange() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    start: monday.toISOString().split('T')[0],
    end: sunday.toISOString().split('T')[0],
  };
}

/**
 * Returns the number of days between two date strings.
 * @param {string} dateStr1
 * @param {string} dateStr2
 * @returns {number} Absolute number of days
 */
export function daysBetween(dateStr1, dateStr2) {
  const d1 = new Date(dateStr1 + 'T00:00:00');
  const d2 = new Date(dateStr2 + 'T00:00:00');
  return Math.round(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
}

/**
 * Checks if two date strings are consecutive days.
 * @param {string} dateStr1
 * @param {string} dateStr2
 * @returns {boolean}
 */
export function isConsecutive(dateStr1, dateStr2) {
  return daysBetween(dateStr1, dateStr2) === 1;
}

/**
 * Returns the previous day's date string.
 * @param {string} dateStr
 * @returns {string}
 */
export function getPreviousDay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Returns the current month as YYYY-MM string.
 */
export function getCurrentMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Checks if a date string falls within the current month.
 * @param {string} dateStr
 * @returns {boolean}
 */
export function isCurrentMonth(dateStr) {
  return dateStr.substring(0, 7) === getCurrentMonth();
}
