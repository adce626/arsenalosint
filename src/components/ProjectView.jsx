import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';
import {
  NodeHistoryProvider,
  useNodeHistory,
} from '../context/NodeHistoryContext.jsx';
import ProjectStats from './ProjectStats.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import GeoDataModal from './GeoDataModal.jsx';
import { useIntent } from '../utils/intentBus.js';
import {
  downloadProjectReport,
  printProjectReport,
} from '../utils/projectReport';
import './ProjectView.css';

// Both panes touch browser-only APIs at import time (React Flow, Leaflet,
// Google Maps), so they must never render on the server. They only ever
// mount after the user opens a project, so ssr:false has no UX cost.
const InfoTab = dynamic(() => import('./InfoTab.jsx'), { ssr: false });
const MapTab = dynamic(() => import('./MapTab.jsx'), { ssr: false });
const TimelineTab = dynamic(() => import('./TimelineTab.jsx'), { ssr: false });
const HypothesesTab = dynamic(() => import('./HypothesesTab.jsx'), {
  ssr: false,
});
const NetworkTab = dynamic(() => import('./NetworkTab.jsx'), { ssr: false });

export default function ProjectView() {
  return (
    <NodeHistoryProvider>
      <ProjectViewInner />
    </NodeHistoryProvider>
  );
}

function ProjectViewInner() {
  const { project, saveProject, closeProject } = useProject();
  const { tab, setTab } = useNavigation();
  const { undo, redo, canUndo, canRedo } = useNodeHistory();
  const [showGeoData, setShowGeoData] = useState(false);
  useIntent('open-geo-data', () => setShowGeoData(true));

  return (
    <div className="project-view">
      <header className="project-topbar">
        <div className="topbar-left">
          <button
            className="icon-btn"
            onClick={closeProject}
            title="Back to projects"
            aria-label="Back to projects"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="project-title">
            <div className="project-name">{project.name}</div>
            {project.target?.name && (
              <div className="project-target">
                Target: {project.target.name}
              </div>
            )}
          </div>
        </div>

        <nav className="tab-switcher" role="tablist">
          <button
            role="tab"
            aria-selected={tab === 'info'}
            className={`tab-button ${tab === 'info' ? 'active' : ''}`}
            onClick={() => setTab('info')}
          >
            Information
          </button>
          <button
            role="tab"
            aria-selected={tab === 'map'}
            className={`tab-button ${tab === 'map' ? 'active' : ''}`}
            onClick={() => setTab('map')}
          >
            Map
          </button>
          <button
            role="tab"
            aria-selected={tab === 'timeline'}
            className={`tab-button ${tab === 'timeline' ? 'active' : ''}`}
            onClick={() => setTab('timeline')}
          >
            Timeline
          </button>
          <button
            role="tab"
            aria-selected={tab === 'analysis'}
            className={`tab-button ${tab === 'analysis' ? 'active' : ''}`}
            onClick={() => setTab('analysis')}
          >
            Analysis
          </button>
          <button
            role="tab"
            aria-selected={tab === 'network'}
            className={`tab-button ${tab === 'network' ? 'active' : ''}`}
            onClick={() => setTab('network')}
          >
            Network
          </button>
        </nav>

        <div className="topbar-right">
          <div className="history-group" role="group" aria-label="History">
            <button
              type="button"
              className="icon-btn"
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
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
                <path d="M9 14 4 9l5-5" />
                <path d="M4 9h11a6 6 0 0 1 0 12h-3" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo"
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
                <path d="m15 14 5-5-5-5" />
                <path d="M20 9H9a6 6 0 0 0 0 12h3" />
              </svg>
            </button>
          </div>
          <ProjectStats />
          <div className="export-group" role="group" aria-label="Export report">
            <button
              type="button"
              className="icon-btn"
              onClick={() => downloadProjectReport(project)}
              title="Download report (Markdown)"
              aria-label="Download report as Markdown"
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
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => printProjectReport(project)}
              title="Print report"
              aria-label="Print report"
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
                <path d="M6 9V2h12v7" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => setShowGeoData(true)}
              title="Import / export locations (GeoJSON, KML, CSV)"
              aria-label="Import or export locations"
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
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
              </svg>
            </button>
          </div>
          <button className="btn btn-secondary" onClick={saveProject}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <path d="M17 21v-8H7v8M7 3v5h8" />
            </svg>
            Save
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="project-main">
        {/* Keep BOTH panes mounted and toggle visibility with CSS so each
            tab preserves its internal state across switches — most
            importantly the Leaflet/Google map viewport (center + zoom). If
            we conditionally render, the map unmounts and re-centers on
            pin #1 every time the user comes back. */}
        <div
          className="tab-pane"
          role="tabpanel"
          aria-hidden={tab !== 'info'}
          hidden={tab !== 'info'}
        >
          <InfoTab />
        </div>
        <div
          className="tab-pane"
          role="tabpanel"
          aria-hidden={tab !== 'map'}
          hidden={tab !== 'map'}
        >
          <MapTab visible={tab === 'map'} />
        </div>
        <div
          className="tab-pane"
          role="tabpanel"
          aria-hidden={tab !== 'timeline'}
          hidden={tab !== 'timeline'}
        >
          <TimelineTab />
        </div>
        <div
          className="tab-pane"
          role="tabpanel"
          aria-hidden={tab !== 'analysis'}
          hidden={tab !== 'analysis'}
        >
          <HypothesesTab />
        </div>
        <div
          className="tab-pane"
          role="tabpanel"
          aria-hidden={tab !== 'network'}
          hidden={tab !== 'network'}
        >
          <NetworkTab />
        </div>
      </main>

      {showGeoData && <GeoDataModal onClose={() => setShowGeoData(false)} />}
    </div>
  );
}
