/**
 * Streak calculation utilities for the Life Dashboard.
 * Streaks represent consecutive days of habit completion.
 */

import { getToday, getPreviousDay } from './dates.js';

/**
 * Calculates the current streak for a given habit.
 * Iterates backwards from today through history, counting consecutive days.
 *
 * @param {string} habitId - The habit to check
 * @param {object} todayLog - Today's log (with habits: { [habitId]: boolean })
 * @param {array} history - Array of past daily logs, sorted newest first
 * @returns {{ current: number, longest: number }}
 */
export function calculateStreak(habitId, todayLog, history) {
  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  // Start from today
  const today = getToday();

  // Check if today's habit is done
  const todayDone = todayLog?.habits?.[habitId] === true;

  // Build a map of date -> done for quick lookup
  const dateMap = new Map();
  if (todayLog) {
    dateMap.set(today, todayDone);
  }

  // Add history entries
  if (history) {
    for (const log of history) {
      if (log.date && log.habits) {
        dateMap.set(log.date, log.habits[habitId] === true);
      }
    }
  }

  // Calculate current streak: walk backwards from today
  let checkDate = today;
  let isCurrentStreak = true;

  // If today isn't done yet, start checking from yesterday
  // (today might not be over yet)
  if (!todayDone) {
    checkDate = getPreviousDay(today);
    isCurrentStreak = true;
  }

  current = todayDone ? 1 : 0;
  if (todayDone) {
    checkDate = getPreviousDay(today);
  }

  // Walk backwards
  for (let i = 0; i < 365; i++) {
    const done = dateMap.get(checkDate);
    if (done === true) {
      if (isCurrentStreak) current++;
    } else {
      isCurrentStreak = false;
      break;
    }
    checkDate = getPreviousDay(checkDate);
  }

  // Calculate longest streak from all history
  const allDates = Array.from(dateMap.keys()).sort();
  tempStreak = 0;

  for (const date of allDates) {
    if (dateMap.get(date)) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  longest = Math.max(longest, current);

  return { current, longest };
}

/**
 * Calculates streaks for all active habits.
 * @param {array} habits - Array of habit objects with { id, name, active }
 * @param {object} todayLog - Today's log
 * @param {array} history - Array of past daily logs
 * @returns {object} Map of habitId -> { current, longest }
 */
export function calculateAllStreaks(habits, todayLog, history) {
  const streaks = {};
  for (const habit of habits) {
    if (habit.active !== false) {
      streaks[habit.id] = calculateStreak(habit.id, todayLog, history);
    }
  }
  return streaks;
}

/**
 * Returns a streak tier label and emoji based on streak length.
 */
export function getStreakTier(streakDays) {
  if (streakDays >= 100) return { label: 'Legendary', emoji: '👑', tier: 'legendary' };
  if (streakDays >= 50) return { label: 'Master', emoji: '🏆', tier: 'master' };
  if (streakDays >= 30) return { label: 'Champion', emoji: '🥇', tier: 'champion' };
  if (streakDays >= 14) return { label: 'Committed', emoji: '💪', tier: 'committed' };
  if (streakDays >= 7) return { label: 'On Fire', emoji: '🔥', tier: 'fire' };
  if (streakDays >= 3) return { label: 'Building', emoji: '🌱', tier: 'building' };
  if (streakDays >= 1) return { label: 'Started', emoji: '✨', tier: 'started' };
  return { label: 'Not started', emoji: '⭕', tier: 'none' };
}
