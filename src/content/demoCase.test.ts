import { describe, it, expect } from 'vitest';
import { DEMO_CASE } from './demoCase';
import { parseProject } from '../utils/projectIO';
import { analyzeNetwork } from '../utils/networkAnalysis';
import { scoreHypothesis, hypothesisVerdict } from '../utils/hypotheses';

describe('demo case', () => {
  it('parses cleanly and keeps every section', () => {
    const project = parseProject(DEMO_CASE);
    expect(project.identifiers).toHaveLength(12);
    expect(project.locations).toHaveLength(6);
    expect(project.events).toHaveLength(7);
    expect(project.hypotheses).toHaveLength(3);
    expect(project.pinLinks).toHaveLength(7);
    expect(project.connections).toHaveLength(12);
  });

  it('forms one connected network with a loop and no isolated nodes', () => {
    const network = analyzeNetwork(
      DEMO_CASE.identifiers,
      DEMO_CASE.connections,
    );
    expect(network.componentCount).toBe(1);
    expect(network.isolated).toHaveLength(0);
    expect(network.independentCycles).toBe(1);
  });

  it('ships one supported and one refuted hypothesis', () => {
    const verdicts = DEMO_CASE.hypotheses.map((h) => hypothesisVerdict(h).id);
    expect(verdicts).toContain('supported');
    expect(verdicts).toContain('refuted');
    // Every hypothesis carries evidence with an explicit direction.
    for (const hypothesis of DEMO_CASE.hypotheses) {
      expect(hypothesis.evidence.length).toBeGreaterThan(0);
      expect(scoreHypothesis(hypothesis)).toBeTypeOf('number');
    }
  });
});
