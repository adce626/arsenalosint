'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'osint-arsenal:favorite-tools';

/**
 * Persisted set of favorited tool ids. Starts empty on both server and first
 * client render, then hydrates from localStorage in an effect so there is no
 * hydration mismatch.
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState(() => new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setFavorites(new Set(parsed));
      }
    } catch {
      // Ignore malformed storage — favorites simply start empty.
    }
  }, []);

  const toggle = useCallback((id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      } catch {
        // Storage may be full/blocked; keep the in-memory set.
      }
      return next;
    });
  }, []);

  const isFavorite = useCallback((id) => favorites.has(id), [favorites]);

  return { favorites, toggle, isFavorite, count: favorites.size };
}
