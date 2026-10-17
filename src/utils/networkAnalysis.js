/**
 * Graph analytics over the identifier/connection network.
 *
 * Everything here is pure and undirected-aware:
 *   - connected components (clusters of related findings)
 *   - degree + betweenness centrality (who brokers between groups)
 *   - cyclomatic number (how many independent loops close back on themselves)
 *   - shortest path between two identifiers (how is X connected to Y?)
 *
 * Betweenness uses Brandes' algorithm for unweighted graphs — O(V·E), which is
 * fine for the hand-built networks this tool produces.
 */

function buildAdjacency(identifiers, connections) {
  const adjacency = new Map();
  for (const identifier of identifiers) adjacency.set(identifier.id, new Set());

  for (const connection of connections ?? []) {
    const { source, target } = connection;
    if (!adjacency.has(source) || !adjacency.has(target)) continue;
    if (source === target) continue;
    adjacency.get(source).add(target);
    adjacency.get(target).add(source);
  }
  return adjacency;
}

function findComponents(adjacency) {
  const seen = new Set();
  const components = [];
  for (const start of adjacency.keys()) {
    if (seen.has(start)) continue;
    const queue = [start];
    seen.add(start);
    const members = [];
    while (queue.length > 0) {
      const node = queue.shift();
      members.push(node);
      for (const neighbor of adjacency.get(node)) {
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    components.push(members);
  }
  return components;
}

/** Brandes' betweenness centrality for an unweighted, undirected graph. */
function betweennessCentrality(adjacency) {
  const nodes = [...adjacency.keys()];
  const centrality = new Map(nodes.map((id) => [id, 0]));

  for (const source of nodes) {
    const stack = [];
    const predecessors = new Map(nodes.map((id) => [id, []]));
    const sigma = new Map(nodes.map((id) => [id, 0]));
    const distance = new Map(nodes.map((id) => [id, -1]));
    sigma.set(source, 1);
    distance.set(source, 0);
    const queue = [source];

    while (queue.length > 0) {
      const v = queue.shift();
      stack.push(v);
      for (const w of adjacency.get(v)) {
        if (distance.get(w) < 0) {
          distance.set(w, distance.get(v) + 1);
          queue.push(w);
        }
        if (distance.get(w) === distance.get(v) + 1) {
          sigma.set(w, sigma.get(w) + sigma.get(v));
          predecessors.get(w).push(v);
        }
      }
    }

    const delta = new Map(nodes.map((id) => [id, 0]));
    while (stack.length > 0) {
      const w = stack.pop();
      for (const v of predecessors.get(w)) {
        const ratio = sigma.get(v) / sigma.get(w);
        delta.set(v, delta.get(v) + ratio * (1 + delta.get(w)));
      }
      if (w !== source) {
        centrality.set(w, centrality.get(w) + delta.get(w));
      }
    }
  }

  // Undirected: every path is counted twice.
  for (const [id, value] of centrality) centrality.set(id, value / 2);
  return centrality;
}

export function analyzeNetwork(identifiers = [], connections = []) {
  const adjacency = buildAdjacency(identifiers, connections);

  const nodeCount = adjacency.size;
  let edgeCount = 0;
  for (const neighbors of adjacency.values()) edgeCount += neighbors.size;
  edgeCount /= 2;

  const degrees = new Map(
    [...adjacency.entries()].map(([id, n]) => [id, n.size]),
  );
  const components = findComponents(adjacency).sort(
    (a, b) => b.length - a.length,
  );
  const isolated = [...adjacency.keys()].filter(
    (id) => adjacency.get(id).size === 0,
  );

  // Cyclomatic number: independent loops = E − V + C (clamped at 0).
  const independentCycles =
    nodeCount === 0
      ? 0
      : Math.max(0, edgeCount - nodeCount + components.length);

  const maxEdges = nodeCount > 1 ? (nodeCount * (nodeCount - 1)) / 2 : 0;
  const density = maxEdges > 0 ? edgeCount / maxEdges : 0;

  const betweenness = betweennessCentrality(adjacency);
  const ranked = [...adjacency.keys()]
    .map((id) => ({
      id,
      degree: degrees.get(id) ?? 0,
      betweenness: betweenness.get(id) ?? 0,
    }))
    .sort((a, b) => b.betweenness - a.betweenness || b.degree - a.degree);

  const avgDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0;

  return {
    nodeCount,
    edgeCount,
    componentCount: components.length,
    components,
    isolated,
    independentCycles,
    density,
    avgDegree,
    ranked,
  };
}

/** Breadth-first shortest path (undirected). Returns nodes + the edges used. */
export function findShortestPath(
  identifiers = [],
  connections = [],
  fromId,
  toId,
) {
  if (!fromId || !toId) return null;
  if (fromId === toId) return { nodes: [fromId], edges: [] };

  const adjacency = new Map();
  for (const identifier of identifiers) adjacency.set(identifier.id, []);
  for (const connection of connections ?? []) {
    if (!adjacency.has(connection.source) || !adjacency.has(connection.target))
      continue;
    if (connection.source === connection.target) continue;
    adjacency.get(connection.source).push({
      id: connection.id,
      node: connection.target,
    });
    adjacency.get(connection.target).push({
      id: connection.id,
      node: connection.source,
    });
  }
  if (!adjacency.has(fromId) || !adjacency.has(toId)) return null;

  const previous = new Map([[fromId, null]]);
  const queue = [fromId];
  while (queue.length > 0) {
    const node = queue.shift();
    if (node === toId) break;
    for (const step of adjacency.get(node)) {
      if (previous.has(step.node)) continue;
      previous.set(step.node, { node, edgeId: step.id });
      queue.push(step.node);
    }
  }

  if (!previous.has(toId)) return null;

  const nodes = [];
  const edges = [];
  let cursor = toId;
  while (cursor != null) {
    nodes.push(cursor);
    const step = previous.get(cursor);
    if (step) {
      edges.push(step.edgeId);
      cursor = step.node;
    } else {
      cursor = null;
    }
  }
  return { nodes: nodes.reverse(), edges: edges.reverse() };
}
