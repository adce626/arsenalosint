/**
 * Node coloring for the Information graph. Two grouping modes:
 *   - 'category': one color per identifier category (social, contact, …)
 *   - 'type':     the per-type badge color from IDENTIFIER_TYPES
 * Kept separate from identifierTypes.js so the palette can be tuned for
 * on-canvas contrast without touching the badge colors.
 */
export const CATEGORY_COLORS = {
  social: '#e1306c',
  contact: '#0ea5a0',
  personal: '#3b82f6',
  vehicle: '#ef4444',
  other: '#6b7280',
};

export const NODE_COLOR_MODES = [
  { id: 'none', label: 'No color' },
  { id: 'category', label: 'By category' },
  { id: 'type', label: 'By type' },
];

// Persisted so the chosen grouping survives reloads (client-only usage).
const STORAGE_KEY = 'osint-tool:node-color-mode';

export function readNodeColorMode() {
  if (typeof window === 'undefined') return 'none';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return NODE_COLOR_MODES.some((m) => m.id === stored) ? stored : 'none';
}

export function writeNodeColorMode(mode) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore storage failures — the mode still works for the session.
  }
}
