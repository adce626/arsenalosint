/**
 * Hypothesis / analysis helpers (a lightweight Analysis of Competing
 * Hypotheses board).
 *
 * Each hypothesis carries evidence items that either SUPPORT or REFUTE it, and
 * a strength (strong / moderate / weak). The score is a weighted sum:
 *   score = Σ(weight of supporting) − Σ(weight of refuting)
 * Positive → supported, negative → refuted, zero with evidence → contested.
 */

export const EVIDENCE_DIRECTIONS = [
  { id: 'supports', label: 'Supports' },
  { id: 'refutes', label: 'Refutes' },
];

export const EVIDENCE_STRENGTHS = [
  { id: 'strong', label: 'Strong', weight: 3 },
  { id: 'moderate', label: 'Moderate', weight: 2 },
  { id: 'weak', label: 'Weak', weight: 1 },
];

export function strengthWeight(strength) {
  return (
    EVIDENCE_STRENGTHS.find((s) => s.id === strength)?.weight ??
    EVIDENCE_STRENGTHS[1].weight
  );
}

export function evidenceWeight(evidence) {
  const w = strengthWeight(evidence?.strength);
  return evidence?.direction === 'refutes' ? -w : w;
}

export function scoreHypothesis(hypothesis) {
  const evidence = hypothesis?.evidence ?? [];
  return evidence.reduce((sum, e) => sum + evidenceWeight(e), 0);
}

/**
 * Qualitative verdict for a hypothesis, derived from its score and whether it
 * has any evidence at all.
 */
export function hypothesisVerdict(hypothesis) {
  const evidence = hypothesis?.evidence ?? [];
  if (evidence.length === 0) return { id: 'empty', label: 'No evidence' };
  const score = scoreHypothesis(hypothesis);
  if (score > 0) return { id: 'supported', label: 'Supported' };
  if (score < 0) return { id: 'refuted', label: 'Refuted' };
  return { id: 'contested', label: 'Contested' };
}

/** Ranked copy of hypotheses, strongest score first. */
export function rankHypotheses(hypotheses = []) {
  return [...hypotheses]
    .map((h) => ({ hypothesis: h, score: scoreHypothesis(h) }))
    .sort((a, b) => b.score - a.score);
}
