/**
 * useDailyLog hook — convenience wrapper around AppContext
 * for accessing and modifying today's daily log and history.
 *
 * Phase 2: Actions now call the API AND update local state for instant UI.
 */

import { useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { computeLifeScore } from '../utils/scoring.js';
import { calculateAllStreaks } from '../utils/streaks.js';
import { getToday } from '../utils/dates.js';
import {
  clearLog,
  completeHabit, uncompleteHabit, createHabit, deleteHabit as deleteHabitAPI,
  addExpenseAPI, deleteExpense as deleteExpenseAPI,
  createHobby, deleteHobby as deleteHobbyAPI, setHobbyTimeAPI,
  updateSettings as updateSettingsAPI,
} from '../services/dataService.js';

export function useDailyLog() {
  const { state, dispatch } = useApp();
  const { todayLog, history, habits, hobbies, settings } = state;

  const activeHabits = useMemo(
    () => habits.filter((h) => h.active !== false),
    [habits]
  );

  // Compute total expenses for today
  const todayExpenses = useMemo(() => {
    return todayLog.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [todayLog.expenses]);

  // Compute Life Score
  const lifeScore = useMemo(() => {
    return computeLifeScore({
      hasLog: todayLog.hasLog,
      moodScore: todayLog.mood.score,
      sleepHours: todayLog.sleep.hours,
      sleepQuality: todayLog.sleep.quality,
      habitCompletions: todayLog.habits,
      activeHabits,
      hobbyTimes: todayLog.hobbies,
      hobbyTarget: settings.hobbyTarget,
      totalSpent: todayExpenses,
      dailyBudget: settings.dailyBudgetTarget,
    });
  }, [todayLog, activeHabits, settings, todayExpenses]);

  // Compute all streaks
  const streaks = useMemo(() => {
    return calculateAllStreaks(activeHabits, todayLog, history);
  }, [activeHabits, todayLog, history]);

  // ── Actions (update local state immediately + persist to API) ──

  // Mood & Sleep: local dispatch only — AppContext handles debounced API save
  const setMood = useCallback((payload) => dispatch({ type: 'SET_MOOD', payload }), [dispatch]);
  const setSleep = useCallback((payload) => dispatch({ type: 'SET_SLEEP', payload }), [dispatch]);
  const toggleMoodTag = useCallback((tag) => dispatch({ type: 'TOGGLE_MOOD_TAG', payload: tag }), [dispatch]);
  const toggleMicroWin = useCallback(() => dispatch({ type: 'TOGGLE_MICRO_WIN' }), [dispatch]);

  // Habits: toggle local + API
  const toggleHabit = useCallback((habitId) => {
    const today = getToday();
    const wasCompleted = todayLog.habits[habitId];
    dispatch({ type: 'TOGGLE_HABIT', payload: habitId });

    if (wasCompleted) {
      uncompleteHabit(habitId, today).catch(err => console.error('Uncomplete habit failed:', err));
    } else {
      completeHabit(habitId, today).catch(err => console.error('Complete habit failed:', err));
    }
  }, [dispatch, todayLog.habits]);

  // Add expense: local + API
  const addExpense = useCallback((expense) => {
    const today = getToday();
    const expenseData = { ...expense, date: today };
    // Optimistic: add to local state immediately
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
    addExpenseAPI(expenseData).catch(err => console.error('Add expense failed:', err));
  }, [dispatch]);

  // Remove expense: local + API
  const removeExpense = useCallback((index) => {
    const expense = todayLog.expenses[index];
    dispatch({ type: 'REMOVE_EXPENSE', payload: index });
    if (expense?.id) {
      deleteExpenseAPI(expense.id).catch(err => console.error('Delete expense failed:', err));
    }
  }, [dispatch, todayLog.expenses]);

  // Hobby time: local + API
  const setHobbyTime = useCallback((hobbyId, minutes) => {
    const today = getToday();
    dispatch({ type: 'SET_HOBBY_TIME', payload: { hobbyId, minutes } });
    setHobbyTimeAPI(hobbyId, today, minutes).catch(err => console.error('Set hobby time failed:', err));
  }, [dispatch]);

  // Add habit: API first (need server-generated ID), then local
  const addHabit = useCallback(async (name, icon) => {
    try {
      const newHabit = await createHabit({ name, icon: icon || '⚡' });
      dispatch({ type: 'ADD_HABIT', payload: newHabit });
    } catch (err) {
      console.error('Add habit failed:', err);
    }
  }, [dispatch]);

  // Remove habit: local + API
  const removeHabit = useCallback((habitId) => {
    dispatch({ type: 'REMOVE_HABIT', payload: habitId });
    deleteHabitAPI(habitId).catch(err => console.error('Delete habit failed:', err));
  }, [dispatch]);

  // Add hobby: API first (need server-generated ID), then local
  const addHobby = useCallback(async (name, icon) => {
    try {
      const newHobby = await createHobby({ name, icon: icon || '🎨' });
      dispatch({ type: 'ADD_HOBBY', payload: newHobby });
    } catch (err) {
      console.error('Add hobby failed:', err);
    }
  }, [dispatch]);

  // Remove hobby: local + API
  const removeHobby = useCallback((hobbyId) => {
    dispatch({ type: 'REMOVE_HOBBY', payload: hobbyId });
    deleteHobbyAPI(hobbyId).catch(err => console.error('Delete hobby failed:', err));
  }, [dispatch]);

  const saveSettings = useCallback(async (nextSettings) => {
    try {
      const saved = await updateSettingsAPI(nextSettings);
      dispatch({ type: 'UPDATE_SETTINGS', payload: saved });
      return saved;
    } catch (err) {
      console.error('Update settings failed:', err);
      throw err;
    }
  }, [dispatch]);

  const clearTodayLog = useCallback(async () => {
    const today = getToday();
    try {
      await clearLog(today);
      dispatch({ type: 'CLEAR_TODAY_LOG', payload: today });
    } catch (err) {
      console.error('Clear today failed:', err);
      throw err;
    }
  }, [dispatch]);

  return {
    todayLog,
    history,
    habits: activeHabits,
    allHabits: habits,
    hobbies,
    settings,
    lifeScore,
    streaks,
    todayExpenses,

    // Actions
    setMood,
    setSleep,
    toggleMoodTag,
    toggleMicroWin,
    toggleHabit,
    addExpense,
    removeExpense,
    setHobbyTime,
    addHabit,
    removeHabit,
    addHobby,
    removeHobby,
    saveSettings,
    clearTodayLog,
  };
}
