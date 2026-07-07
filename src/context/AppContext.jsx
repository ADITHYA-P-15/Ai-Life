/**
 * AppContext — Global state provider for the Life Dashboard.
 *
 * Phase 2: Loads data from PostgreSQL via API and persists changes back.
 * Uses React Context + useReducer. The state shape is identical to Phase 0
 * so all downstream components (pages, hooks) continue working unchanged.
 */

import { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';
import { getToday } from '../utils/dates.js';
import { useAuth } from './AuthContext.jsx';
import {
  fetchLog, saveLog, fetchHistory,
  fetchHabits,
  fetchHobbies,
  fetchSettings,
} from '../services/dataService.js';

const AppContext = createContext(null);

// ---------- Default values (used while loading) ----------
function createEmptyLog(date) {
  return {
    date: date || getToday(),
    hasLog: false,
    mood: { score: 0, note: '', tags: [] },
    microWin: false,
    sleep: { hours: 0, quality: '' },
    habits: {},
    expenses: [],
    hobbies: {},
  };
}

const DEFAULT_SETTINGS = {
  monthlyBudget: 30000,
  dailyBudgetTarget: 1000,
  hobbyTarget: 60,
};

function getInitialState() {
  return {
    todayLog: createEmptyLog(getToday()),
    history: [],
    habits: [],
    hobbies: [],
    settings: DEFAULT_SETTINGS,
  };
}

// ---------- Reducer ----------
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_MOOD':
      return {
        ...state,
        todayLog: {
          ...state.todayLog,
          hasLog: true,
          mood: { ...state.todayLog.mood, ...action.payload },
        },
      };

    case 'TOGGLE_MOOD_TAG': {
      const tag = action.payload;
      const tags = state.todayLog.mood.tags || [];
      const nextTags = tags.includes(tag)
        ? tags.filter((item) => item !== tag)
        : [...tags, tag];

      return {
        ...state,
        todayLog: {
          ...state.todayLog,
          hasLog: true,
          mood: { ...state.todayLog.mood, tags: nextTags },
        },
      };
    }

    case 'TOGGLE_MICRO_WIN':
      return {
        ...state,
        todayLog: {
          ...state.todayLog,
          hasLog: true,
          microWin: !state.todayLog.microWin,
        },
      };

    case 'SET_SLEEP':
      return {
        ...state,
        todayLog: {
          ...state.todayLog,
          hasLog: true,
          sleep: { ...state.todayLog.sleep, ...action.payload },
        },
      };

    case 'TOGGLE_HABIT': {
      const habitId = action.payload;
      return {
        ...state,
        todayLog: {
          ...state.todayLog,
          hasLog: true,
          habits: {
            ...state.todayLog.habits,
            [habitId]: !state.todayLog.habits[habitId],
          },
        },
      };
    }

    case 'ADD_EXPENSE':
      return {
        ...state,
        todayLog: {
          ...state.todayLog,
          hasLog: true,
          expenses: [...state.todayLog.expenses, action.payload],
        },
      };

    case 'REMOVE_EXPENSE':
      return {
        ...state,
        todayLog: {
          ...state.todayLog,
          hasLog: true,
          expenses: state.todayLog.expenses.filter((_, i) => i !== action.payload),
        },
      };

    case 'SET_HOBBY_TIME':
      return {
        ...state,
        todayLog: {
          ...state.todayLog,
          hasLog: true,
          hobbies: {
            ...state.todayLog.hobbies,
            [action.payload.hobbyId]: action.payload.minutes,
          },
        },
      };

    case 'ADD_HABIT':
      return {
        ...state,
        habits: [...state.habits, action.payload],
      };

    case 'REMOVE_HABIT':
      return {
        ...state,
        habits: state.habits.filter((h) => h.id !== action.payload),
      };

    case 'TOGGLE_HABIT_ACTIVE':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.payload ? { ...h, active: !h.active } : h
        ),
      };

    case 'ADD_HOBBY':
      return {
        ...state,
        hobbies: [...state.hobbies, action.payload],
      };

    case 'REMOVE_HOBBY':
      return {
        ...state,
        hobbies: state.hobbies.filter((h) => h.id !== action.payload),
      };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'CLEAR_TODAY_LOG':
      return {
        ...state,
        todayLog: createEmptyLog(action.payload || getToday()),
        history: state.history.filter((log) => log.date !== (action.payload || getToday())),
      };

    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    default:
      return state;
  }
}

// ---------- Provider Component ----------
export function AppProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(appReducer, null, getInitialState);
  const [dataLoaded, setDataLoaded] = useState(false);
  const saveTimerRef = useRef(null);
  const prevLogRef = useRef(null);

  // ── Load all data from API on auth ──
  useEffect(() => {
    if (!isAuthenticated) {
      setDataLoaded(false);
      return;
    }

    const today = getToday();
    let cancelled = false;

    async function loadAll() {
      try {
        const [todayLog, history, habits, hobbies, settings] = await Promise.all([
          fetchLog(today),
          fetchHistory(90),
          fetchHabits(),
          fetchHobbies(),
          fetchSettings(),
        ]);

        if (cancelled) return;

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            todayLog: { ...todayLog, date: today },
            history,
            habits,
            hobbies,
            settings,
          },
        });
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load data from API:', err);
        setDataLoaded(true); // Still show UI with defaults
      }
    }

    loadAll();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  // ── Debounced save of mood/sleep to API ──
  useEffect(() => {
    if (!isAuthenticated || !dataLoaded) return;

    // Skip the very first render after load to avoid saving back what we just fetched
    if (prevLogRef.current === null) {
      prevLogRef.current = state.todayLog;
      return;
    }

    // Only save if mood or sleep actually changed
    const prev = prevLogRef.current;
    const curr = state.todayLog;

    if (!curr.hasLog) {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      prevLogRef.current = curr;
      return;
    }

    const logStateChanged = prev.hasLog !== curr.hasLog;
    const prevTags = JSON.stringify(prev.mood.tags || []);
    const currTags = JSON.stringify(curr.mood.tags || []);
    const moodChanged = prev.mood.score !== curr.mood.score || prev.mood.note !== curr.mood.note || prevTags !== currTags;
    const sleepChanged = prev.sleep.hours !== curr.sleep.hours || prev.sleep.quality !== curr.sleep.quality;
    const microWinChanged = prev.microWin !== curr.microWin;

    if (!logStateChanged && !moodChanged && !sleepChanged && !microWinChanged) {
      prevLogRef.current = curr;
      return;
    }

    prevLogRef.current = curr;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const today = getToday();
      saveLog(today, { mood: curr.mood, sleep: curr.sleep, microWin: curr.microWin }).catch(err => {
        console.error('Failed to save log:', err);
      });
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [state.todayLog, isAuthenticated, dataLoaded]);

  return (
    <AppContext.Provider value={{ state, dispatch, dataLoaded }}>
      {children}
    </AppContext.Provider>
  );
}

// ---------- Hook ----------
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { createEmptyLog };
