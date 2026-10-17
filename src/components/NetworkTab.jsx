import { useMemo, useState } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';
import { getTypeDef, getDisplayLabel } from '../identifierTypes.js';
import { analyzeNetwork, findShortestPath } from '../utils/networkAnalysis.js';
import './NetworkTab.css';

function NodeChip({ identifier, onSelect }) {
  if (!identifier) return null;
  return (
    <button
      type="button"
      className="net-chip"
      onClick={() => onSelect(identifier.id)}
    >
      <span className="net-chip-type">{getTypeDef(identifier.type).label}</span>
      <span className="net-chip-label">{getDisplayLabel(identifier)}</span>
    </button>
  );
}

export default function NetworkTab() {
  const { project } = useProject();
  const { navigateToIdentifier, setTab } = useNavigation();

  const identifiers = useMemo(() => project?.identifiers ?? [], [project]);
  const connections = useMemo(() => project?.connections ?? [], [project]);

  const analysis = useMemo(
    () => analyzeNetwork(identifiers, connections),
    [identifiers, connections],
  );

  const byId = useMemo(
    () => new Map(identifiers.map((i) => [i.id, i])),
    [identifiers],
  );

  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [path, setPath] = useState(null);
  const [pathSearched, setPathSearched] = useState(false);

  const jumpTo = (id) => {
    navigateToIdentifier(id);
    setTab('info');
  };

  const runPath = () => {
    setPath(findShortestPath(identifiers, connections, fromId, toId));
    setPathSearched(true);
  };

  if (identifiers.length < 2) {
    return (
      <div className="network-tab">
        <div className="network-inner">
          <header className="network-header">
            <h2 className="network-title">Network analysis</h2>
          </header>
          <div className="network-empty">
            <p>
              Add at least two identifiers and connect them to see analysis.
            </p>
            <p className="network-empty-hint">
              This view finds the clusters in your case, the entities that
              broker between them, and the shortest route between any two
              findings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const topConnectors = analysis.ranked.filter((r) => r.degree > 0).slice(0, 8);
  const maxBetweenness = Math.max(
    1,
    ...topConnectors.map((r) => r.betweenness),
  );
  const clusters = analysis.components.filter((c) => c.length > 1);

  return (
    <div className="network-tab">
      <div className="network-inner">
        <header className="network-header">
          <h2 className="network-title">Network analysis</h2>
          <p className="network-sub">
            Structural read of the case graph — clusters, brokers, loops, and
            the shortest route between two findings.
          </p>
        </header>

        <section className="network-stats" aria-label="Network summary">
          <Stat label="Entities" value={analysis.nodeCount} />
          <Stat label="Connections" value={analysis.edgeCount} />
          <Stat label="Clusters" value={analysis.componentCount} />
          <Stat label="Loops" value={analysis.independentCycles} />
          <Stat
            label="Density"
            value={`${(analysis.density * 100).toFixed(1)}%`}
          />
          <Stat label="Avg. links" value={analysis.avgDegree.toFixed(2)} />
        </section>

        <section className="network-card">
          <h3>Path finder</h3>
          <p className="network-card-sub">
            How are two findings connected? Finds the shortest chain of links
            between them.
          </p>
          <div className="network-path-form">
            <select
              value={fromId}
              onChange={(e) => {
                setFromId(e.target.value);
                setPathSearched(false);
              }}
              aria-label="From identifier"
            >
              <option value="">From…</option>
              {identifiers.map((i) => (
                <option key={i.id} value={i.id}>
                  {getDisplayLabel(i)}
                </option>
              ))}
            </select>
            <span className="network-path-arrow">→</span>
            <select
              value={toId}
              onChange={(e) => {
                setToId(e.target.value);
                setPathSearched(false);
              }}
              aria-label="To identifier"
            >
              <option value="">To…</option>
              {identifiers.map((i) => (
                <option key={i.id} value={i.id}>
                  {getDisplayLabel(i)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={runPath}
              disabled={!fromId || !toId}
            >
              Find path
            </button>
          </div>

          {pathSearched && (
            <div className="network-path-result">
              {path ? (
                <div className="network-path-chain">
                  {path.nodes.map((id, index) => (
                    <span className="network-path-step" key={id}>
                      {index > 0 && (
                        <span className="network-path-link">→</span>
                      )}
                      <NodeChip identifier={byId.get(id)} onSelect={jumpTo} />
                    </span>
                  ))}
                  <span className="network-path-length">
                    {path.nodes.length - 1} hop
                    {path.nodes.length - 1 === 1 ? '' : 's'}
                  </span>
                </div>
              ) : (
                <p className="network-path-none">
                  No chain connects these two findings.
                </p>
              )}
            </div>
          )}
        </section>

        <div className="network-columns">
          <section className="network-card">
            <h3>Key connectors</h3>
            <p className="network-card-sub">
              Highest betweenness — the entities that bridge otherwise separate
              parts of the case.
            </p>
            {topConnectors.length === 0 ? (
              <p className="network-muted">No connections yet.</p>
            ) : (
              <ul className="network-connectors">
                {topConnectors.map((row, index) => (
                  <li key={row.id}>
                    <span className="network-rank">{index + 1}</span>
                    <div className="network-connector-body">
                      <NodeChip
                        identifier={byId.get(row.id)}
                        onSelect={jumpTo}
                      />
                      <span className="network-connector-bar">
                        <span
                          className="network-connector-fill"
                          style={{
                            width: `${Math.max(
                              6,
                              (row.betweenness / maxBetweenness) * 100,
                            )}%`,
                          }}
                        />
                      </span>
                    </div>
                    <span className="network-connector-meta">
                      {row.degree} links
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="network-card">
            <h3>Clusters</h3>
            <p className="network-card-sub">
              Groups that hold together on their own. Everything else is a
              bridge away.
            </p>
            {clusters.length === 0 ? (
              <p className="network-muted">No multi-node clusters yet.</p>
            ) : (
              <ul className="network-clusters">
                {clusters.map((members, index) => (
                  <li key={members[0]} className="network-cluster">
                    <div className="network-cluster-head">
                      <span>Cluster {index + 1}</span>
                      <span className="network-cluster-size">
                        {members.length} entities
                      </span>
                    </div>
                    <div className="network-cluster-members">
                      {members.map((id) => (
                        <NodeChip
                          key={id}
                          identifier={byId.get(id)}
                          onSelect={jumpTo}
                        />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {analysis.isolated.length > 0 && (
          <section className="network-card">
            <h3>Unconnected findings</h3>
            <p className="network-card-sub">
              Not linked to anything yet — often the next lead to chase.
            </p>
            <div className="network-cluster-members">
              {analysis.isolated.map((id) => (
                <NodeChip
                  key={id}
                  identifier={byId.get(id)}
                  onSelect={jumpTo}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="network-stat">
      <span className="network-stat-value">{value}</span>
      <span className="network-stat-label">{label}</span>
    </div>
  );
}
