import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useProject } from '../context/ProjectContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';
import { useNodeHistory } from '../context/NodeHistoryContext.jsx';
import {
  getTypeDef,
  getDisplayLabel,
  getSecondaryLabel,
} from '../identifierTypes.js';
import IdentifierBadge from './IdentifierBadge.jsx';
import IdentifierModal from './IdentifierModal.jsx';
import IdentifierNode from './IdentifierNode.jsx';
import NodeCreationMenu from './NodeCreationMenu.jsx';
import BulkImportModal from './BulkImportModal.jsx';
import MergeModal from './MergeModal.jsx';
import {
  mergeIdentifiersInto,
  findDuplicateGroups,
} from '../utils/mergeIdentifiers.js';
import { useIntent } from '../utils/intentBus.js';
import {
  CATEGORY_COLORS,
  NODE_COLOR_MODES,
  readNodeColorMode,
  writeNodeColorMode,
} from '../nodeGroupColors.js';
import {
  CONFIDENCE_LEVELS,
  CONFIDENCE_COLORS,
  normalizeConfidence,
} from '../confidence.js';
import './InfoTab.css';

const NODE_TYPES = { identifier: IdentifierNode };

const DEFAULT_EDGE_OPTIONS = {
  type: 'default',
};

const OPPOSITE_HANDLE = {
  top: 'bottom',
  right: 'left',
  bottom: 'top',
  left: 'right',
};

export default function InfoTab() {
  return (
    <ReactFlowProvider>
      <InfoTabInner />
    </ReactFlowProvider>
  );
}

function InfoTabInner() {
  const {
    project,
    addIdentifier,
    bulkAddIdentifiers,
    updateIdentifier,
    deleteIdentifier,
    addConnection,
    deleteConnection,
    updateConnection,
    updateProject,
  } = useProject();
  const { theme } = useTheme();
  const { setHoveredIdentifierId, focus, consumeFocus } = useNavigation();
  const {
    recordCreate,
    recordBatchCreate,
    recordDelete,
    recordBatchDelete,
    recordMove,
    recordBatchMoves,
    recordCreateEdge,
    recordBatchDeleteEdges,
    recordCreateNodeWithEdge,
    recordMerge,
    undo,
    redo,
    setClipboard,
    getClipboard,
  } = useNodeHistory();
  const dragStartPositionsRef = useRef(new Map());
  const identifiers = useMemo(
    () => project?.identifiers ?? [],
    [project?.identifiers],
  );
  const connections = useMemo(
    () => project?.connections ?? [],
    [project?.connections],
  );

  const [modalState, setModalState] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [menuState, setMenuState] = useState(null);
  const { screenToFlowPosition, fitView } = useReactFlow();
  const [focusedIdentifierId, setFocusedIdentifierId] = useState(null);
  const [search, setSearch] = useState('');
  const [colorMode, setColorMode] = useState('none');
  const [edgeMenu, setEdgeMenu] = useState(null);
  const [showMerge, setShowMerge] = useState(false);
  const [mergeTab, setMergeTab] = useState('selected');
  const sidebarRowRefs = useRef(new Map());

  const selectedIds = useMemo(
    () => nodes.filter((n) => n.selected).map((n) => n.id),
    [nodes],
  );
  const duplicateCount = useMemo(
    () => findDuplicateGroups(identifiers).length,
    [identifiers],
  );

  // Restore the saved grouping after mount (localStorage isn't available during
  // SSR, so reading it in the initializer would cause a hydration mismatch).
  useEffect(() => {
    setColorMode(readNodeColorMode());
  }, []);

  // Close the link inspector on Escape.
  useEffect(() => {
    if (!edgeMenu) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setEdgeMenu(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [edgeMenu]);

  const filteredIdentifiers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return identifiers;
    return identifiers.filter((id) => {
      const haystack = `${getTypeDef(id.type).label} ${getDisplayLabel(id)} ${getSecondaryLabel(id)}`;
      return haystack.toLowerCase().includes(q);
    });
  }, [identifiers, search]);

  // React to NavigationContext focus requests targeted at an identifier.
  useEffect(() => {
    if (!focus || focus.kind !== 'identifier') return;
    const id = focus.id;
    const token = focus.token;
    setFocusedIdentifierId(id);
    // Scroll sidebar row into view if present.
    const row = sidebarRowRefs.current.get(id);
    row?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    const clearTimer = setTimeout(() => setFocusedIdentifierId(null), 2200);
    consumeFocus(token);
    return () => clearTimeout(clearTimer);
  }, [focus, consumeFocus]);

  // Reconcile nodes from identifiers.
  // Project position is authoritative — that way undo/redo (which updates the
  // project state) actually moves the node back on the canvas. Local state is
  // only a fallback (e.g. transient state during the React Flow drag itself,
  // when the project hasn't been written yet).
  useEffect(() => {
    setNodes((current) => {
      const currentMap = new Map(current.map((n) => [n.id, n]));
      return identifiers.map((id) => {
        const existing = currentMap.get(id.id);
        const def = getTypeDef(id.type);
        const color =
          colorMode === 'none'
            ? null
            : colorMode === 'category'
              ? (CATEGORY_COLORS[def.category] ?? null)
              : (def.color ?? null);
        return {
          id: id.id,
          type: 'identifier',
          position: id.position ?? existing?.position ?? { x: 60, y: 60 },
          data: { identifier: id, color },
          selected: existing?.selected ?? false,
        };
      });
    });
  }, [identifiers, colorMode]);

  // Edges mirror project connections exactly. Dedupe by id defensively in
  // case older project state ended up with duplicate connection records.
  useEffect(() => {
    const seen = new Set();
    const deduped = [];
    for (const c of connections) {
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      const conf = normalizeConfidence(c.confidence);
      deduped.push({
        id: c.id,
        source: c.source,
        target: c.target,
        sourceHandle: c.sourceHandle ?? undefined,
        targetHandle: c.targetHandle ?? undefined,
        label: c.label || undefined,
        style: conf
          ? { stroke: CONFIDENCE_COLORS[conf], strokeWidth: 2.2 }
          : undefined,
        labelStyle: { fill: 'var(--text-2)', fontSize: 10 },
        labelBgStyle: { fill: 'var(--bg-1)' },
        labelBgPadding: [4, 2],
        labelBgBorderRadius: 3,
      });
    }
    setEdges(deduped);
  }, [connections]);

  const onNodesChange = useCallback(
    (changes) => {
      setNodes((ns) => applyNodeChanges(changes, ns));

      // Multiple nodes can be removed in a single change-batch (e.g. delete-key
      // on a multi-select). Capture them all up front and record as a SINGLE
      // history entry so one Ctrl+Z restores the whole batch.
      const removes = changes.filter((c) => c.type === 'remove');
      if (removes.length === 0) return;
      const items = removes
        .map((c) => {
          const ident = (project?.identifiers ?? []).find((i) => i.id === c.id);
          if (!ident) return null;
          const connections = (project?.connections ?? []).filter(
            (co) => co.source === c.id || co.target === c.id,
          );
          const pinLinks = (project?.pinLinks ?? []).filter(
            (l) => l.identifierId === c.id,
          );
          return { identifier: ident, connections, pinLinks };
        })
        .filter(Boolean);
      // Commit deletions to project state.
      for (const c of removes) deleteIdentifier(c.id);
      // Record undo entry (single or batched).
      if (items.length === 1) {
        recordDelete(
          items[0].identifier,
          items[0].connections,
          items[0].pinLinks,
        );
      } else if (items.length > 1) {
        recordBatchDelete(items);
      }
    },
    [
      deleteIdentifier,
      project?.identifiers,
      project?.connections,
      project?.pinLinks,
      recordDelete,
      recordBatchDelete,
    ],
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setEdges((es) => applyEdgeChanges(changes, es));

      // Capture removed edge records BEFORE deletion so undo can restore them.
      const removes = changes.filter((c) => c.type === 'remove');
      if (removes.length === 0) return;
      const removed = removes
        .map((c) => (project?.connections ?? []).find((co) => co.id === c.id))
        .filter(Boolean);
      for (const c of removes) deleteConnection(c.id);
      if (removed.length === 1) recordBatchDeleteEdges([removed[0]]);
      else if (removed.length > 1) recordBatchDeleteEdges(removed);
    },
    [deleteConnection, project?.connections, recordBatchDeleteEdges],
  );

  const onConnect = useCallback(
    (params) => {
      const created = addConnection(
        params.source,
        params.target,
        params.sourceHandle,
        params.targetHandle,
      );
      if (created) recordCreateEdge(created);
    },
    [addConnection, recordCreateEdge],
  );

  // Blender-style: drag a wire to empty space → open a menu to create a new node.
  const onConnectEnd = useCallback(
    (event, connectionState) => {
      // Only fire when the drop wasn't on a valid handle.
      if (connectionState?.isValid) return;
      const sourceNodeId = connectionState?.fromNode?.id;
      if (!sourceNodeId) return;
      // Skip if the drop landed on an existing node body (toNode set, just no handle).
      if (connectionState?.toNode) return;
      const clientX = event.clientX ?? event.changedTouches?.[0]?.clientX;
      const clientY = event.clientY ?? event.changedTouches?.[0]?.clientY;
      if (clientX == null || clientY == null) return;
      const flowPos = screenToFlowPosition({ x: clientX, y: clientY });
      setMenuState({
        sourceNodeId,
        sourceHandle: connectionState?.fromHandle?.id ?? null,
        screenX: clientX,
        screenY: clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
      });
    },
    [screenToFlowPosition],
  );

  const handleMenuSelect = useCallback(
    (typeKey) => {
      if (!menuState) return;
      const { sourceNodeId, sourceHandle, flowX, flowY } = menuState;
      // Offset position so the node is roughly centered on the drop point.
      const created = addIdentifier({
        type: typeKey,
        position: { x: flowX - 110, y: flowY - 30 },
      });
      let createdConn = null;
      if (created && sourceNodeId) {
        // Target handle = opposite side of the source handle so the wire
        // routes naturally (e.g., dragging from the right handle lands on
        // the new node's left handle).
        const targetHandle = sourceHandle
          ? (OPPOSITE_HANDLE[sourceHandle] ?? null)
          : null;
        createdConn = addConnection(
          sourceNodeId,
          created.id,
          sourceHandle,
          targetHandle,
        );
      }
      // Record node + edge as a SINGLE undo entry so one Ctrl+Z removes both.
      if (created) recordCreateNodeWithEdge(created, createdConn);
      setMenuState(null);
    },
    [menuState, addIdentifier, addConnection, recordCreateNodeWithEdge],
  );

  // Right-click on the canvas pane → open the same menu (free-floating node,
  // no auto-connection).
  const onPaneContextMenu = useCallback(
    (event) => {
      event.preventDefault();
      const clientX = event.clientX ?? event.changedTouches?.[0]?.clientX;
      const clientY = event.clientY ?? event.changedTouches?.[0]?.clientY;
      if (clientX == null || clientY == null) return;
      const flowPos = screenToFlowPosition({ x: clientX, y: clientY });
      setMenuState({
        sourceNodeId: null,
        screenX: clientX,
        screenY: clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
      });
    },
    [screenToFlowPosition],
  );

  const onNodeDragStart = useCallback((_event, node) => {
    // Stash the starting position so we can record the diff on dragStop.
    dragStartPositionsRef.current.set(node.id, { ...node.position });
  }, []);

  const onNodeDragStop = useCallback(
    (_event, node) => {
      const start = dragStartPositionsRef.current.get(node.id);
      dragStartPositionsRef.current.delete(node.id);
      updateIdentifier(node.id, { position: node.position });
      if (start) recordMove(node.id, start, { ...node.position });
    },
    [updateIdentifier, recordMove],
  );

  const onNodeDoubleClick = useCallback(
    (_event, node) => {
      const ident = identifiers.find((i) => i.id === node.id);
      if (ident) setModalState({ mode: 'edit', initial: ident });
    },
    [identifiers],
  );

  const handleBulkImport = (records) => {
    if (!records || records.length === 0) return;
    const created = bulkAddIdentifiers(records);
    recordBatchCreate(created);
    setShowImport(false);
  };

  const openAdd = () => setModalState({ mode: 'add', initial: null });
  useIntent('add-identifier', openAdd);
  const openEdit = (identifier) =>
    setModalState({ mode: 'edit', initial: identifier });
  const closeModal = () => setModalState(null);

  const handleSubmit = (payload) => {
    if (modalState?.mode === 'edit' && payload.id) {
      updateIdentifier(payload.id, {
        type: payload.type,
        fields: payload.fields,
        notes: payload.notes,
        customIconId: payload.customIconId ?? null,
        confidence: payload.confidence ?? '',
        source: payload.source ?? '',
        accessedAt: payload.accessedAt ?? '',
        archivedUrl: payload.archivedUrl ?? '',
        reliability: payload.reliability ?? '',
        credibility: payload.credibility ?? '',
      });
    } else {
      const created = addIdentifier(payload);
      if (created) recordCreate(created);
    }
    closeModal();
  };

  const handleDelete = (e, id, label) => {
    e.stopPropagation();
    if (!confirm(`Delete "${label}"? You can press Ctrl+Z to restore.`)) return;
    const ident = (project?.identifiers ?? []).find((i) => i.id === id);
    const conns = (project?.connections ?? []).filter(
      (c) => c.source === id || c.target === id,
    );
    const links = (project?.pinLinks ?? []).filter(
      (l) => l.identifierId === id,
    );
    deleteIdentifier(id);
    if (ident) recordDelete(ident, conns, links);
  };

  // Merge one or more identifiers into a keeper as a single undo step.
  const handleMerge = useCallback(
    (keepId, removeIds) => {
      if (!project) return;
      const before = {
        identifiers: project.identifiers,
        connections: project.connections,
        pinLinks: project.pinLinks ?? [],
        events: project.events ?? [],
      };
      const next = mergeIdentifiersInto(project, keepId, removeIds);
      if (next === project) return;
      const after = {
        identifiers: next.identifiers,
        connections: next.connections,
        pinLinks: next.pinLinks ?? [],
        events: next.events ?? [],
      };
      updateProject(() => next);
      recordMerge(before, after);
    },
    [project, updateProject, recordMerge],
  );

  // ---- Copy / Paste / Duplicate ---------------------------------------------
  const cloneRecordsWithOffset = useCallback(
    (records, offset = { x: 30, y: 30 }) =>
      records.map((r) => ({
        ...r,
        id: undefined, // bulkAddIdentifiers generates fresh ids
        position: r.position
          ? { x: r.position.x + offset.x, y: r.position.y + offset.y }
          : undefined,
      })),
    [],
  );

  const handleCopySelected = useCallback(() => {
    const selectedIds = new Set(
      nodes.filter((n) => n.selected).map((n) => n.id),
    );
    if (selectedIds.size === 0) return false;
    const records = identifiers.filter((i) => selectedIds.has(i.id));
    setClipboard(records);
    return true;
  }, [nodes, identifiers, setClipboard]);

  const handlePaste = useCallback(() => {
    const records = getClipboard();
    if (!records || records.length === 0) return false;
    const created = bulkAddIdentifiers(cloneRecordsWithOffset(records));
    recordBatchCreate(created);
    return true;
  }, [
    getClipboard,
    bulkAddIdentifiers,
    cloneRecordsWithOffset,
    recordBatchCreate,
  ]);

  const handleDuplicateSelected = useCallback(() => {
    const selectedIds = new Set(
      nodes.filter((n) => n.selected).map((n) => n.id),
    );
    if (selectedIds.size === 0) return false;
    const records = identifiers.filter((i) => selectedIds.has(i.id));
    if (records.length === 0) return false;
    const created = bulkAddIdentifiers(cloneRecordsWithOffset(records));
    recordBatchCreate(created);
    return true;
  }, [
    nodes,
    identifiers,
    bulkAddIdentifiers,
    cloneRecordsWithOffset,
    recordBatchCreate,
  ]);

  // ---- Auto layout -----------------------------------------------------------
  // Arrange every node deterministically, then record the whole arrangement as
  // a single undo step. 'grid' packs rows/cols by node count; 'circle' spreads
  // evenly around the origin.
  const applyAutoLayout = useCallback(
    (kind) => {
      const list = identifiers;
      if (list.length < 2) return;
      const currentPositions = new Map(nodes.map((n) => [n.id, n.position]));
      const moves = [];
      const cols = Math.ceil(Math.sqrt(list.length));
      const radius = Math.max(240, list.length * 42);
      list.forEach((ident, i) => {
        const from = currentPositions.get(ident.id) ?? { x: 60, y: 60 };
        let to;
        if (kind === 'circle') {
          const angle = (2 * Math.PI * i) / list.length - Math.PI / 2;
          to = {
            x: Math.round(radius * Math.cos(angle)),
            y: Math.round(radius * Math.sin(angle)),
          };
        } else {
          to = {
            x: (i % cols) * 300,
            y: Math.floor(i / cols) * 150,
          };
        }
        updateIdentifier(ident.id, { position: to });
        moves.push({ id: ident.id, from, to });
      });
      recordBatchMoves(moves);
      requestAnimationFrame(() => fitView({ duration: 300, padding: 0.2 }));
    },
    [identifiers, nodes, updateIdentifier, recordBatchMoves, fitView],
  );

  // ---- Keyboard shortcuts ----------------------------------------------------
  useEffect(() => {
    const handler = (e) => {
      // Skip when typing in inputs or while a modal is open.
      const el = document.activeElement;
      const tag = el?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || el?.isContentEditable)
        return;
      if (modalState || menuState) return;
      const meta = e.metaKey || e.ctrlKey;
      if (!meta) return;
      const k = e.key.toLowerCase();
      if (k === 'z' && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (k === 'z') {
        e.preventDefault();
        undo();
      } else if (k === 'y') {
        e.preventDefault();
        redo();
      } else if (k === 'c') {
        if (handleCopySelected()) e.preventDefault();
      } else if (k === 'v') {
        if (handlePaste()) e.preventDefault();
      } else if (k === 'd') {
        if (handleDuplicateSelected()) e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    undo,
    redo,
    handleCopySelected,
    handlePaste,
    handleDuplicateSelected,
    modalState,
    menuState,
  ]);

  return (
    <div className="info-tab">
      <aside className="info-sidebar">
        <div className="sidebar-header">
          <h3>Identifiers</h3>
          <div className="sidebar-header-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setShowImport(true)}
            >
              Import
            </button>
            <button className="btn btn-primary btn-sm" onClick={openAdd}>
              + Add
            </button>
          </div>
        </div>
        {identifiers.length > 0 && (
          <div className="sidebar-search">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter identifiers…"
              aria-label="Filter identifiers"
            />
          </div>
        )}
        {identifiers.length === 0 ? (
          <div className="empty-state">
            <p>No identifiers yet.</p>
            <p className="empty-hint">
              Add social profiles, phones, emails, names, vehicles, and custom
              fields here.
            </p>
          </div>
        ) : filteredIdentifiers.length === 0 ? (
          <div className="empty-state">
            <p>No identifiers match “{search.trim()}”.</p>
          </div>
        ) : (
          <ul className="identifier-list">
            {filteredIdentifiers.map((id) => {
              const def = getTypeDef(id.type);
              const display = getDisplayLabel(id);
              const secondary = getSecondaryLabel(id);
              const isFocused = focusedIdentifierId === id.id;
              return (
                <li
                  key={id.id}
                  ref={(el) => {
                    if (el) sidebarRowRefs.current.set(id.id, el);
                    else sidebarRowRefs.current.delete(id.id);
                  }}
                  className={`identifier-item ${isFocused ? 'focused' : ''}`}
                  onClick={() => openEdit(id)}
                  onMouseEnter={() => setHoveredIdentifierId(id.id)}
                  onMouseLeave={() => setHoveredIdentifierId(null)}
                >
                  <IdentifierBadge
                    typeKey={id.type}
                    customIconId={id.customIconId}
                    size="md"
                  />
                  <div className="identifier-body">
                    <div className="identifier-type">{def.label}</div>
                    <div className="identifier-label">{display}</div>
                    {secondary && (
                      <div className="identifier-secondary">{secondary}</div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="identifier-delete"
                    onClick={(e) => handleDelete(e, id.id, display)}
                    aria-label={`Delete ${display}`}
                    title="Delete"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      <div className="info-canvas">
        {identifiers.length > 0 && (
          <div className="canvas-toolbar">
            <label className="canvas-toolbar-field">
              <span>Color</span>
              <select
                value={colorMode}
                onChange={(e) => {
                  setColorMode(e.target.value);
                  writeNodeColorMode(e.target.value);
                }}
                aria-label="Color nodes by"
              >
                {NODE_COLOR_MODES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="canvas-toolbar-group"
              role="group"
              aria-label="Auto layout"
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => applyAutoLayout('grid')}
                disabled={identifiers.length < 2}
                title="Arrange nodes in a grid"
              >
                Grid
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => applyAutoLayout('circle')}
                disabled={identifiers.length < 2}
                title="Arrange nodes in a circle"
              >
                Circle
              </button>
            </div>
            <div
              className="canvas-toolbar-group"
              role="group"
              aria-label="Merge identifiers"
            >
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setMergeTab('selected');
                  setShowMerge(true);
                }}
                disabled={identifiers.length < 2}
                title="Merge the selected nodes into one"
              >
                Merge
                {selectedIds.length >= 2 ? ` (${selectedIds.length})` : ''}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setMergeTab('duplicates');
                  setShowMerge(true);
                }}
                disabled={identifiers.length < 2}
                title="Find identifiers that share an email, phone, username, or plate"
              >
                Duplicates
                {duplicateCount > 0 ? ` (${duplicateCount})` : ''}
              </button>
            </div>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={NODE_TYPES}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneContextMenu={onPaneContextMenu}
          onEdgeClick={(event, edge) =>
            setEdgeMenu({ id: edge.id, x: event.clientX, y: event.clientY })
          }
          onPaneClick={() => setEdgeMenu(null)}
          connectionMode="loose"
          defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
          defaultViewport={{ x: 20, y: 20, zoom: 1 }}
          minZoom={0.2}
          maxZoom={2}
          deleteKeyCode={['Delete', 'Backspace']}
          multiSelectionKeyCode={['Control', 'Meta']}
          proOptions={{ hideAttribution: true }}
          colorMode={theme}
        >
          <Background gap={20} size={1} />
          <Controls position="bottom-left" showInteractive={false} />
          <MiniMap pannable zoomable />
        </ReactFlow>

        {edgeMenu &&
          (() => {
            const conn = connections.find((c) => c.id === edgeMenu.id);
            if (!conn) return null;
            return (
              <div
                className="edge-inspector"
                style={{ left: edgeMenu.x, top: edgeMenu.y }}
                onMouseDown={(e) => e.stopPropagation()}
                role="dialog"
                aria-label="Edit link"
              >
                <div className="edge-inspector-header">
                  <span>Link</span>
                  <button
                    type="button"
                    className="icon-btn"
                    onClick={() => setEdgeMenu(null)}
                    aria-label="Close"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <label className="edge-inspector-field">
                  <span>Label</span>
                  <input
                    value={conn.label ?? ''}
                    onChange={(e) =>
                      updateConnection(conn.id, { label: e.target.value })
                    }
                    placeholder="how they relate"
                  />
                </label>
                <div className="edge-inspector-field">
                  <span>Confidence</span>
                  <div className="edge-inspector-conf">
                    {CONFIDENCE_LEVELS.map((l) => {
                      const active =
                        normalizeConfidence(conn.confidence) === l.id;
                      return (
                        <button
                          key={l.id || 'none'}
                          type="button"
                          className={active ? 'active' : ''}
                          style={
                            active
                              ? { borderColor: l.color, color: l.color }
                              : undefined
                          }
                          onClick={() =>
                            updateConnection(conn.id, { confidence: l.id })
                          }
                          title={l.label}
                        >
                          {l.short}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button
                  type="button"
                  className="edge-inspector-delete"
                  onClick={() => {
                    recordBatchDeleteEdges([conn]);
                    deleteConnection(conn.id);
                    setEdgeMenu(null);
                  }}
                >
                  Delete link
                </button>
              </div>
            );
          })()}

        {identifiers.length === 0 && (
          <div className="canvas-hint">
            <h3>Empty canvas</h3>
            <p>
              Add identifiers from the sidebar, or <strong>right-click</strong>{' '}
              on the canvas to add one here. They'll appear as nodes you can
              drag and connect.
            </p>
            <p className="canvas-hint-tips">
              <strong>Drag a handle</strong> to another node to connect them, or
              to empty space to add a new node.
              <br />
              <strong>Double-click</strong> a node to edit.
              <br />
              <strong>Select</strong> and press <kbd>Delete</kbd> /{' '}
              <kbd>Backspace</kbd> to remove a node or edge.
            </p>
          </div>
        )}

        {identifiers.length > 0 && (
          <div className="canvas-tips" aria-hidden="true">
            <span>
              <kbd>Drag handle</kbd> → new node
            </span>
            <span className="canvas-tips-sep">·</span>
            <span>
              <kbd>Right-click</kbd> menu
            </span>
            <span className="canvas-tips-sep">·</span>
            <span>
              <kbd>⌘D</kbd> duplicate
            </span>
            <span className="canvas-tips-sep">·</span>
            <span>
              <kbd>⌘Z</kbd> / <kbd>⌘Y</kbd>
            </span>
            <span className="canvas-tips-sep">·</span>
            <span>
              <kbd>Del</kbd> remove
            </span>
          </div>
        )}
      </div>

      {modalState && (
        <IdentifierModal
          initial={modalState.initial}
          onClose={closeModal}
          onSubmit={handleSubmit}
        />
      )}

      {showImport && (
        <BulkImportModal
          existing={identifiers}
          onClose={() => setShowImport(false)}
          onCreate={handleBulkImport}
        />
      )}

      {showMerge && (
        <MergeModal
          identifiers={identifiers}
          initialSelection={selectedIds}
          initialTab={mergeTab}
          onClose={() => setShowMerge(false)}
          onMerge={handleMerge}
        />
      )}

      {menuState && (
        <NodeCreationMenu
          position={{ x: menuState.screenX, y: menuState.screenY }}
          onSelect={handleMenuSelect}
          onClose={() => setMenuState(null)}
        />
      )}
    </div>
  );
}
