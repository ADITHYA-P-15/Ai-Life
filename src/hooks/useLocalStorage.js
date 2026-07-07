/**
 * Custom React hook for localStorage persistence with debounced writes.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Reads/writes JSON to localStorage with automatic serialization
 * and debounced writes to prevent thrashing during slider drags.
 *
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if key doesn't exist
 * @param {number} debounceMs - Debounce delay for writes (default: 300ms)
 * @returns {[value, setValue]}
 */
export function useLocalStorage(key, initialValue, debounceMs = 300) {
  // Initialize from localStorage or use initial value
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.warn(`Error reading localStorage key "${key}":`, err);
    }
    return typeof initialValue === 'function' ? initialValue() : initialValue;
  });

  const timeoutRef = useRef(null);
  const keyRef = useRef(key);
  keyRef.current = key;

  // Debounced write to localStorage
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(keyRef.current, JSON.stringify(value));
      } catch (err) {
        console.warn(`Error writing localStorage key "${keyRef.current}":`, err);
        // Handle quota exceeded
        if (err.name === 'QuotaExceededError') {
          // Try to free space by removing oldest history entries
          try {
            const historyKey = 'life-dashboard-history';
            const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
            if (history.length > 30) {
              localStorage.setItem(historyKey, JSON.stringify(history.slice(-30)));
              // Retry the write
              localStorage.setItem(keyRef.current, JSON.stringify(value));
            }
          } catch {
            // Give up gracefully
          }
        }
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, debounceMs]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [value, setValue];
}

/**
 * Immediately writes a value to localStorage (no debounce).
 * Useful for critical saves like before page unload.
 */
export function writeImmediately(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage key "${key}":`, err);
  }
}

/**
 * Reads a value from localStorage.
 */
export function readFromStorage(key, defaultValue = null) {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}
