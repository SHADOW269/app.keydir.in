'use client';

import { useState, useEffect, useCallback } from 'react';

function loadState<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveState<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function usePersistentState<T>(key: string, fallback: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(fallback);

  useEffect(() => {
    setState(loadState(key, fallback));
  }, [key]);

  const setPersistent = useCallback((value: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = value instanceof Function ? value(prev) : value;
      saveState(key, next);
      return next;
    });
  }, [key]);

  return [state, setPersistent];
}
