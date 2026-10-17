/**
 * Admiralty source-grading code: a two-axis assessment used alongside a
 * finding's confidence.
 *
 *   reliability (A–F) — how trustworthy the SOURCE is.
 *   credibility (1–6) — how believable this specific INFORMATION is.
 *
 * Combined they read like "B2" and are reported next to every identifier,
 * location, and timeline entry.
 */

export const RELIABILITY_LEVELS = [
  {
    id: '',
    short: '–',
    label: 'Unrated',
    description: 'No source-reliability assessment recorded.',
  },
  {
    id: 'A',
    short: 'A',
    label: 'A · Completely reliable',
    description: 'No doubt about authenticity, trustworthiness, or competence.',
  },
  {
    id: 'B',
    short: 'B',
    label: 'B · Usually reliable',
    description: 'Minor doubts; history of valid information in most cases.',
  },
  {
    id: 'C',
    short: 'C',
    label: 'C · Fairly reliable',
    description: 'Some doubt; has provided valid information in the past.',
  },
  {
    id: 'D',
    short: 'D',
    label: 'D · Not usually reliable',
    description: 'Significant doubt; history of invalid information.',
  },
  {
    id: 'E',
    short: 'E',
    label: 'E · Unreliable',
    description: 'Lacks authenticity, trustworthiness, or competence.',
  },
  {
    id: 'F',
    short: 'F',
    label: 'F · Cannot be judged',
    description: 'No basis for evaluating reliability (e.g. a first contact).',
  },
];

export const CREDIBILITY_LEVELS = [
  { id: '', short: '–', label: 'Unrated', description: 'Not yet assessed.' },
  {
    id: '1',
    short: '1',
    label: '1 · Confirmed',
    description: 'Confirmed by at least one other independent source.',
  },
  {
    id: '2',
    short: '2',
    label: '2 · Probably true',
    description: 'Consistent with other information; logical in itself.',
  },
  {
    id: '3',
    short: '3',
    label: '3 · Possibly true',
    description: 'Plausible but not corroborated.',
  },
  {
    id: '4',
    short: '4',
    label: '4 · Doubtful',
    description: 'Not confirmed and somewhat improbable.',
  },
  {
    id: '5',
    short: '5',
    label: '5 · Improbable',
    description: 'Contradicted by other information; illogical.',
  },
  {
    id: '6',
    short: '6',
    label: '6 · Cannot be judged',
    description: 'No basis for judging the information.',
  },
];

export const RELIABILITY_IDS = RELIABILITY_LEVELS.map((l) => l.id);
export const CREDIBILITY_IDS = CREDIBILITY_LEVELS.map((l) => l.id);

export function normalizeReliability(value) {
  const v = String(value ?? '')
    .trim()
    .toUpperCase();
  return RELIABILITY_IDS.includes(v) ? v : '';
}

export function normalizeCredibility(value) {
  const v = String(value ?? '').trim();
  return CREDIBILITY_IDS.includes(v) ? v : '';
}

export function reliabilityLabel(value) {
  const level = RELIABILITY_LEVELS.find(
    (l) => l.id === normalizeReliability(value),
  );
  return level && level.id ? level.label : '';
}

export function credibilityLabel(value) {
  const level = CREDIBILITY_LEVELS.find(
    (l) => l.id === normalizeCredibility(value),
  );
  return level && level.id ? level.label : '';
}

/** Combined code, e.g. "B2", or '' when neither axis is rated. */
export function admiraltyCode(reliability, credibility) {
  const r = normalizeReliability(reliability);
  const c = normalizeCredibility(credibility);
  if (!r && !c) return '';
  return `${r || '-'}${c || '-'}`;
}

/** Compact human description, e.g. "B2 — usually reliable · probably true". */
export function admiraltyLabel(reliability, credibility) {
  const code = admiraltyCode(reliability, credibility);
  if (!code) return '';
  const r = normalizeReliability(reliability);
  const c = normalizeCredibility(credibility);
  const parts = [];
  if (r) parts.push(RELIABILITY_LEVELS.find((l) => l.id === r)?.label ?? '');
  if (c) parts.push(CREDIBILITY_LEVELS.find((l) => l.id === c)?.label ?? '');
  return `${code} — ${parts.join(' · ')}`;
}
