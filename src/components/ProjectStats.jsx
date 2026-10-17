import { useEffect, useMemo, useRef, useState } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import {
  CATEGORIES,
  IDENTIFIER_TYPES,
  getTypeDef,
} from '../identifierTypes.js';
import './ProjectStats.css';

/**
 * Compact, read-only dashboard that summarises the current project: counts of
 * identifiers / connections / pins / links, plus a breakdown of identifiers by
 * category and by type. Opens as a popover anchored to the top bar.
 */
export default function ProjectStats() {
  const { project } = useProject();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const stats = useMemo(() => {
    const identifiers = project?.identifiers ?? [];
    const byType = new Map();
    const byCategory = new Map();

    for (const identifier of identifiers) {
      byType.set(identifier.type, (byType.get(identifier.type) ?? 0) + 1);
      const category = IDENTIFIER_TYPES[identifier.type]?.category ?? 'other';
      byCategory.set(category, (byCategory.get(category) ?? 0) + 1);
    }

    const typeRows = [...byType.entries()]
      .map(([type, count]) => {
        const def = getTypeDef(type);
        return { type, count, label: def.label, color: def.color };
      })
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));

    const categoryRows = Object.entries(CATEGORIES)
      .sort(([, a], [, b]) => a.order - b.order)
      .map(([key, meta]) => ({
        key,
        label: meta.label,
        count: byCategory.get(key) ?? 0,
      }))
      .filter((row) => row.count > 0);

    return {
      identifierCount: identifiers.length,
      connectionCount: (project?.connections ?? []).length,
      locationCount: (project?.locations ?? []).length,
      linkCount: (project?.pinLinks ?? []).length,
      typeRows,
      categoryRows,
      maxCategory: Math.max(1, ...categoryRows.map((r) => r.count)),
    };
  }, [project]);

  return (
    <div className="project-stats" ref={rootRef}>
      <button
        type="button"
        className="icon-btn stats-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-label="Project statistics"
        title="Project statistics"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 3v18h18" />
          <rect x="7" y="11" width="3" height="6" />
          <rect x="12" y="7" width="3" height="10" />
          <rect x="17" y="13" width="3" height="4" />
        </svg>
      </button>

      {open && (
        <div
          className="project-stats-panel"
          role="dialog"
          aria-label="Project statistics"
        >
          <div className="stats-header">
            <span className="stats-title">Project overview</span>
            <button
              type="button"
              className="stats-close"
              onClick={() => setOpen(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          <div className="stats-grid">
            <div className="stats-cell">
              <div className="stats-value">{stats.identifierCount}</div>
              <div className="stats-label">Identifiers</div>
            </div>
            <div className="stats-cell">
              <div className="stats-value">{stats.connectionCount}</div>
              <div className="stats-label">Connections</div>
            </div>
            <div className="stats-cell">
              <div className="stats-value">{stats.locationCount}</div>
              <div className="stats-label">Pins</div>
            </div>
            <div className="stats-cell">
              <div className="stats-value">{stats.linkCount}</div>
              <div className="stats-label">Links</div>
            </div>
          </div>

          {stats.categoryRows.length > 0 && (
            <div className="stats-section">
              <div className="stats-section-title">By category</div>
              {stats.categoryRows.map((row) => (
                <div className="stats-bar" key={row.key}>
                  <span className="stats-bar-label">{row.label}</span>
                  <span className="stats-bar-track">
                    <span
                      className="stats-bar-fill"
                      style={{
                        width: `${(row.count / stats.maxCategory) * 100}%`,
                      }}
                    />
                  </span>
                  <span className="stats-bar-count">{row.count}</span>
                </div>
              ))}
            </div>
          )}

          {stats.typeRows.length > 0 && (
            <div className="stats-section">
              <div className="stats-section-title">By type</div>
              {stats.typeRows.map((row) => (
                <div className="stats-type" key={row.type}>
                  <span
                    className="stats-dot"
                    style={{ background: row.color }}
                  />
                  <span className="stats-type-label">{row.label}</span>
                  <span className="stats-type-count">{row.count}</span>
                </div>
              ))}
            </div>
          )}

          {stats.identifierCount === 0 && (
            <div className="stats-empty">
              No identifiers yet — add a node on the Information tab.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
