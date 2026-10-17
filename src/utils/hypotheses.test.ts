import { describe, it, expect } from 'vitest';
import {
  scoreHypothesis,
  hypothesisVerdict,
  rankHypotheses,
  evidenceWeight,
} from './hypotheses';

const ev = (direction: string, strength: string) => ({
  direction,
  strength,
});

describe('hypotheses scoring', () => {
  it('weights evidence by strength and sign', () => {
    expect(evidenceWeight(ev('supports', 'strong'))).toBe(3);
    expect(evidenceWeight(ev('refutes', 'weak'))).toBe(-1);
    expect(evidenceWeight(ev('supports', 'unknown'))).toBe(2); // default moderate
  });

  it('scores a hypothesis as weighted sum', () => {
    const h = {
      evidence: [
        ev('supports', 'strong'), // +3
        ev('supports', 'weak'), // +1
        ev('refutes', 'moderate'), // -2
      ],
    };
    expect(scoreHypothesis(h)).toBe(2);
    expect(hypothesisVerdict(h).id).toBe('supported');
  });

  it('classifies refuted and contested', () => {
    expect(hypothesisVerdict({ evidence: [ev('refutes', 'strong')] }).id).toBe(
      'refuted',
    );
    expect(
      hypothesisVerdict({
        evidence: [ev('supports', 'weak'), ev('refutes', 'weak')],
      }).id,
    ).toBe('contested');
    expect(hypothesisVerdict({ evidence: [] }).id).toBe('empty');
  });

  it('ranks hypotheses by score descending', () => {
    const ranked = rankHypotheses([
      { id: 'a', evidence: [ev('supports', 'weak')] },
      { id: 'b', evidence: [ev('supports', 'strong')] },
      { id: 'c', evidence: [ev('refutes', 'moderate')] },
    ]);
    expect(ranked.map((r) => r.hypothesis.id)).toEqual(['b', 'a', 'c']);
    expect(ranked[0].score).toBe(3);
  });
});
