/**
 * Confidence model shared by identifiers, locations, connections, and events.
 *
 * A single source of truth for the levels, their display order, and the accent
 * colour each one maps to in the graph and reports.
 */
export const CONFIDENCE_LEVELS = [
  { id: '', label: 'Unrated', short: '—', color: 'var(--text-2)' },
  { id: 'high', label: 'High', short: 'High', color: '#5bb8a6' },
  { id: 'medium', label: 'Medium', short: 'Med', color: '#c9a56b' },
  { id: 'low', label: 'Low', short: 'Low', color: '#ef4444' },
];

export const CONFIDENCE_COLORS = {
  high: '#5bb8a6',
  medium: '#c9a56b',
  low: '#ef4444',
};

export const CONFIDENCE_IDS = ['', 'high', 'medium', 'low'];

export function normalizeConfidence(value) {
  return CONFIDENCE_IDS.includes(value) ? value : '';
}

export function confidenceLabel(value) {
  return (
    CONFIDENCE_LEVELS.find((l) => l.id === normalizeConfidence(value))?.label ??
    'Unrated'
  );
}

export function confidenceColor(value) {
  return CONFIDENCE_COLORS[normalizeConfidence(value)] ?? null;
}
