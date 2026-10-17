'use client';

import { useCallback, useSyncExternalStore } from 'react';

const KEY = 'osint-arsenal:guides-read';
const EVENT = 'osint:guides-progress';
const EMPTY = [];

/** In-memory mirror so `getSnapshot` returns a stable reference between reads. */
let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next) {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable (private mode / quota) — keep the in-memory copy */
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/**
 * Tracks which field guides the reader has completed, persisted locally so the
 * index can show a "X of N completed" progress bar. Never leaves the device.
 */
export function useGuidesProgress() {
  const ids = useSyncExternalStore(subscribe, read, () => EMPTY);

  const setRead = useCallback((id, value) => {
    const set = new Set(read());
    if (value) set.add(id);
    else set.delete(id);
    write([...set]);
  }, []);

  const toggle = useCallback((id) => {
    const set = new Set(read());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    write([...set]);
  }, []);

  return { ids, isRead: (id) => ids.includes(id), setRead, toggle };
}
