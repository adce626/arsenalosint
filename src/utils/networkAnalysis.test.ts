import { describe, it, expect } from 'vitest';
import { analyzeNetwork, findShortestPath } from './networkAnalysis';

const ids = (...names: string[]) => names.map((n) => ({ id: n, type: 'name' }));
const edge = (id: string, source: string, target: string) => ({
  id,
  source,
  target,
});

describe('analyzeNetwork', () => {
  it('counts nodes, edges, components and isolated nodes', () => {
    const result = analyzeNetwork(ids('a', 'b', 'c', 'x', 'y', 'lone'), [
      edge('e1', 'a', 'b'),
      edge('e2', 'b', 'c'),
      edge('e3', 'x', 'y'),
    ]);
    expect(result.nodeCount).toBe(6);
    expect(result.edgeCount).toBe(3);
    expect(result.componentCount).toBe(3); // {a,b,c}, {x,y}, {lone}
    expect(result.isolated).toEqual(['lone']);
    expect(result.components[0]).toHaveLength(3);
  });

  it('counts independent cycles (cyclomatic number)', () => {
    const triangle = analyzeNetwork(ids('a', 'b', 'c'), [
      edge('e1', 'a', 'b'),
      edge('e2', 'b', 'c'),
      edge('e3', 'c', 'a'),
    ]);
    expect(triangle.independentCycles).toBe(1);

    const tree = analyzeNetwork(ids('a', 'b', 'c'), [
      edge('e1', 'a', 'b'),
      edge('e2', 'b', 'c'),
    ]);
    expect(tree.independentCycles).toBe(0);
  });

  it('ignores duplicate and self edges', () => {
    const result = analyzeNetwork(ids('a', 'b'), [
      edge('e1', 'a', 'b'),
      edge('e2', 'b', 'a'),
      edge('e3', 'a', 'a'),
    ]);
    expect(result.edgeCount).toBe(1);
  });

  it('scores betweenness highest on the broker node', () => {
    const result = analyzeNetwork(ids('a', 'b', 'c', 'd'), [
      edge('e1', 'a', 'b'),
      edge('e2', 'b', 'c'),
      edge('e3', 'c', 'd'),
    ]);
    const byId = new Map(result.ranked.map((r) => [r.id, r.betweenness]));
    expect(byId.get('b') ?? 0).toBeGreaterThan(byId.get('a') ?? 0);
    expect(byId.get('c') ?? 0).toBeGreaterThan(byId.get('d') ?? 0);
    expect(['b', 'c']).toContain(result.ranked[0].id);
  });
});

describe('findShortestPath', () => {
  const identifiers = ids('a', 'b', 'c', 'd', 'z');
  const connections = [
    edge('e1', 'a', 'b'),
    edge('e2', 'b', 'c'),
    edge('e3', 'c', 'd'),
  ];

  it('finds the chain between two connected nodes', () => {
    const path = findShortestPath(identifiers, connections, 'a', 'd');
    expect(path?.nodes).toEqual(['a', 'b', 'c', 'd']);
    expect(path?.edges).toEqual(['e1', 'e2', 'e3']);
  });

  it('prefers the shortest route', () => {
    const withShortcut = [...connections, edge('e4', 'a', 'c')];
    const path = findShortestPath(identifiers, withShortcut, 'a', 'd');
    expect(path?.nodes).toEqual(['a', 'c', 'd']);
    expect(path?.edges).toEqual(['e4', 'e3']);
  });

  it('returns a single node when from === to', () => {
    expect(findShortestPath(identifiers, connections, 'a', 'a')).toEqual({
      nodes: ['a'],
      edges: [],
    });
  });

  it('returns null when there is no route', () => {
    expect(findShortestPath(identifiers, connections, 'a', 'z')).toBeNull();
  });
});
