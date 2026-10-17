'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LESSONS } from '@/content/basics/index.js';
import { PLAYBOOKS } from '@/content/playbooks/index.js';
import { GLOSSARY_TERMS, termSlug } from '@/content/glossary/index.js';
import { getDisplayLabel, getTypeDef } from '@/identifierTypes.js';
import { useProject } from '@/context/ProjectContext.jsx';
import { useNavigation } from '@/context/NavigationContext.jsx';
import { useTheme } from '@/context/ThemeContext.jsx';
import { requestIntent } from '@/utils/intentBus.js';
import {
  downloadProjectReport,
  printProjectReport,
} from '@/utils/projectReport';
import './CommandPalette.css';

const PAGES = [
  {
    key: 'page:home',
    group: 'Pages',
    label: 'Home',
    sub: 'Overview',
    href: '/',
  },
  {
    key: 'page:tools',
    group: 'Pages',
    label: 'Tools',
    sub: 'Browse the arsenal',
    href: '/tools',
  },
  {
    key: 'page:guides',
    group: 'Pages',
    label: 'Field Guides',
    sub: 'Methodology',
    href: '/guides',
  },
  {
    key: 'page:playbooks',
    group: 'Pages',
    label: 'Playbooks',
    sub: 'End-to-end workflows',
    href: '/playbooks',
  },
  {
    key: 'page:glossary',
    group: 'Pages',
    label: 'Glossary',
    sub: 'OSINT vocabulary',
    href: '/glossary',
  },
  {
    key: 'page:reference',
    group: 'Pages',
    label: 'Reference sheet',
    sub: 'Printable cheat sheet',
    href: '/reference',
  },
  {
    key: 'page:mapping',
    group: 'Pages',
    label: 'Mapping Tool',
    sub: 'Workspace',
    href: '/mapping',
  },
];

const MAX_TOOL_RESULTS = 30;

/** Bold the matched slice of a label (case-insensitive), when there is a query. */
function Highlight({ text, query }) {
  const q = query.trim();
  if (!q) return text;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export default function CommandPalette() {
  const router = useRouter();
  const { project } = useProject();
  const { navigateToIdentifier, setTab } = useNavigation();
  const { toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [tools, setTools] = useState([]);
  const [loadingTools, setLoadingTools] = useState(false);
  const toolsRequestedRef = useRef(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const closePalette = useCallback(() => {
    setOpen(false);
    setQuery('');
    setActive(0);
  }, []);

  // Global hotkey (Ctrl/⌘+K) plus a window event so buttons elsewhere can
  // open the palette without prop drilling.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    const onOpenEvent = () => setOpen(true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('open-command-palette', onOpenEvent);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('open-command-palette', onOpenEvent);
    };
  }, []);

  // On open: reset, focus, and lazily fetch the tool index once.
  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    requestAnimationFrame(() => inputRef.current?.focus());
    if (!toolsRequestedRef.current) {
      toolsRequestedRef.current = true;
      setLoadingTools(true);
      fetch('/api/search-index')
        .then((response) => (response.ok ? response.json() : []))
        .then((data) => setTools(Array.isArray(data) ? data : []))
        .catch(() => setTools([]))
        .finally(() => setLoadingTools(false));
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = [];

    const openWorkspace = (tab, intent) => {
      if (intent) requestIntent(intent);
      setTab(tab);
      router.push('/mapping');
    };

    const actions = [
      ...(project
        ? [
            {
              key: 'action:add-identifier',
              label: 'Add identifier',
              sub: 'Workspace · graph',
              keywords: 'node entity person profile create',
              action: () => openWorkspace('info', 'add-identifier'),
            },
            {
              key: 'action:add-event',
              label: 'Add timeline event',
              sub: 'Workspace · timeline',
              keywords: 'date when history create',
              action: () => openWorkspace('timeline', 'add-event'),
            },
            {
              key: 'action:new-hypothesis',
              label: 'New hypothesis',
              sub: 'Workspace · analysis',
              keywords: 'ach competing theory create',
              action: () => openWorkspace('analysis', 'new-hypothesis'),
            },
            {
              key: 'action:geo-data',
              label: 'Import / export locations',
              sub: 'GeoJSON, KML, CSV',
              keywords: 'geojson kml csv gis pins map',
              action: () => openWorkspace('map', 'open-geo-data'),
            },
            {
              key: 'action:export-report',
              label: 'Export report (Markdown)',
              sub: 'Download file',
              keywords: 'save markdown case',
              action: () => downloadProjectReport(project),
            },
            {
              key: 'action:print-report',
              label: 'Print report / save as PDF',
              sub: 'Print',
              keywords: 'pdf print export case',
              action: () => printProjectReport(project),
            },
          ]
        : []),
      {
        key: 'action:toggle-theme',
        label: 'Toggle theme',
        sub: 'Light / dark',
        keywords: 'appearance dark light mode',
        action: () => toggleTheme(),
      },
      {
        key: 'action:shortcuts',
        label: 'Keyboard shortcuts',
        sub: 'Reference',
        keywords: 'keys help hotkeys bindings',
        action: () => window.dispatchEvent(new Event('osint:show-shortcuts')),
      },
    ];

    for (const item of actions) {
      if (
        !q ||
        `${item.label} ${item.sub} ${item.keywords ?? ''}`
          .toLowerCase()
          .includes(q)
      ) {
        out.push({ ...item, group: 'Actions' });
      }
    }

    if (q) {
      for (const identifier of project?.identifiers ?? []) {
        const label = getDisplayLabel(identifier);
        const typeLabel = getTypeDef(identifier.type).label;
        if (
          label.toLowerCase().includes(q) ||
          typeLabel.toLowerCase().includes(q)
        ) {
          out.push({
            key: `ident:${identifier.id}`,
            group: 'Identifiers',
            label,
            sub: typeLabel,
            action: () => {
              navigateToIdentifier(identifier.id);
              router.push('/mapping');
            },
          });
        }
      }
    }

    for (const lesson of LESSONS) {
      const haystack = `${lesson.title} ${lesson.summary ?? ''}`.toLowerCase();
      if (!q || haystack.includes(q)) {
        out.push({
          key: `guide:${lesson.id}`,
          group: 'Guides',
          label: lesson.title,
          sub: lesson.summary ?? '',
          action: () => router.push(`/guides/${lesson.id}`),
        });
      }
    }

    for (const playbook of PLAYBOOKS) {
      const haystack =
        `${playbook.title} ${playbook.summary ?? ''}`.toLowerCase();
      if (!q || haystack.includes(q)) {
        out.push({
          key: `playbook:${playbook.slug}`,
          group: 'Playbooks',
          label: playbook.title,
          sub: playbook.summary ?? '',
          action: () => router.push(`/playbooks/${playbook.slug}`),
        });
      }
    }

    if (q) {
      let glossaryHits = 0;
      for (const term of GLOSSARY_TERMS) {
        if (glossaryHits >= 8) break;
        const haystack = `${term.term} ${term.aka ?? ''}`.toLowerCase();
        if (!haystack.includes(q)) continue;
        glossaryHits += 1;
        out.push({
          key: `glossary:${term.term}`,
          group: 'Glossary',
          label: term.term,
          sub: term.aka ?? 'Term',
          action: () => router.push(`/glossary#${termSlug(term.term)}`),
        });
      }
    }

    if (q) {
      let matched = 0;
      for (const tool of tools) {
        if (matched >= MAX_TOOL_RESULTS) break;
        if (!tool.name.toLowerCase().includes(q)) continue;
        matched += 1;
        out.push({
          key: `tool:${tool.name}`,
          group: 'Tools',
          label: tool.name,
          sub: tool.category,
          action: () => {
            if (tool.url) {
              window.open(tool.url, '_blank', 'noopener,noreferrer');
            } else {
              router.push(`/tools?q=${encodeURIComponent(tool.name)}`);
            }
          },
        });
      }
    }

    for (const page of PAGES) {
      if (!q || `${page.label} ${page.sub}`.toLowerCase().includes(q)) {
        out.push({
          ...page,
          action: () => router.push(page.href),
        });
      }
    }

    return out.slice(0, 60);
  }, [
    query,
    project,
    tools,
    router,
    navigateToIdentifier,
    setTab,
    toggleTheme,
  ]);

  // Keep the active index in range as results change.
  useEffect(() => {
    setActive((value) => Math.min(value, Math.max(0, results.length - 1)));
  }, [results.length]);

  // Scroll the active row into view.
  useEffect(() => {
    if (!open) return;
    const el = listRef.current?.querySelector(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const runItem = useCallback(
    (item) => {
      if (!item) return;
      closePalette();
      item.action();
    },
    [closePalette],
  );

  const onInputKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((value) => Math.min(value + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((value) => Math.max(value - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runItem(results[active]);
    }
  };

  if (!open) return null;

  const groups = [];
  const groupIndex = new Map();
  results.forEach((item, index) => {
    let bucket = groupIndex.get(item.group);
    if (!bucket) {
      bucket = { group: item.group, items: [] };
      groupIndex.set(item.group, bucket);
      groups.push(bucket);
    }
    bucket.items.push({ ...item, index });
  });

  return (
    <div
      className="command-palette-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closePalette();
      }}
    >
      <div
        className="command-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        <div className="command-palette-input-row">
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="command-palette-input"
            placeholder="Search tools, guides, pages, or run an action…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
            aria-label="Search tools, guides and pages"
            aria-controls="command-palette-listbox"
            aria-activedescendant={
              results.length > 0 ? `cp-opt-${active}` : undefined
            }
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="command-palette-kbd">Esc</kbd>
        </div>

        <div
          className="command-palette-list"
          ref={listRef}
          id="command-palette-listbox"
          role="listbox"
          aria-label="Results"
        >
          {results.length === 0 && (
            <div className="command-palette-empty">
              {loadingTools
                ? 'Loading tools…'
                : `No results for “${query.trim()}”.`}
            </div>
          )}

          {groups.map((group) => (
            <div className="command-palette-group" key={group.group}>
              <div className="command-palette-group-title">{group.group}</div>
              {group.items.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  id={`cp-opt-${item.index}`}
                  role="option"
                  aria-selected={item.index === active}
                  data-index={item.index}
                  className={`command-palette-item ${
                    item.index === active ? 'active' : ''
                  }`}
                  onMouseMove={() => setActive(item.index)}
                  onClick={() => runItem(item)}
                >
                  <span className="command-palette-item-label">
                    <Highlight text={item.label} query={query} />
                  </span>
                  {item.sub && (
                    <span className="command-palette-item-sub">{item.sub}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>

        <div className="command-palette-footer">
          <span>
            <kbd>↑</kbd>
            <kbd>↓</kbd> navigate
          </span>
          <span>
            <kbd>↵</kbd> open
          </span>
          <span>
            <kbd>Ctrl</kbd>
            <kbd>K</kbd> toggle
          </span>
          <span>
            <kbd>?</kbd> shortcuts
          </span>
        </div>
      </div>
    </div>
  );
}
