import { useEffect, useMemo, useRef, useState } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';
import { getDisplayLabel } from '../identifierTypes.js';
import { confidenceLabel } from '../confidence.js';
import IdentifierBadge from './IdentifierBadge.jsx';
import TimelineEventModal from './TimelineEventModal.jsx';
import { useIntent } from '../utils/intentBus.js';
import './TimelineTab.css';

function toTime(value) {
  if (!value) return null;
  const t = Date.parse(value);
  return Number.isNaN(t) ? null : t;
}

function formatWhen(value, time) {
  if (time == null) return value || 'Undated';
  return new Date(time).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function TimelineTab() {
  const { project, addEvent, updateEvent, deleteEvent } = useProject();
  const { navigateToPin, navigateToIdentifier } = useNavigation();

  const events = useMemo(() => project?.events ?? [], [project]);
  const pins = useMemo(() => project?.locations ?? [], [project]);
  const identifiers = useMemo(() => project?.identifiers ?? [], [project]);

  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [modal, setModal] = useState(null);
  useIntent('add-event', () => setModal({ event: null }));

  const pinById = useMemo(() => new Map(pins.map((p) => [p.id, p])), [pins]);
  const idById = useMemo(
    () => new Map(identifiers.map((i) => [i.id, i])),
    [identifiers],
  );

  const items = useMemo(() => {
    const out = [];
    for (const e of events) {
      out.push({
        kind: 'event',
        key: `event-${e.id}`,
        date: e.date,
        time: toTime(e.date),
        event: e,
      });
    }
    pins.forEach((p) => {
      if (p.visitedAt) {
        out.push({
          kind: 'visit',
          key: `visit-${p.id}`,
          date: p.visitedAt,
          time: toTime(p.visitedAt),
          pin: p,
        });
      }
    });
    out.sort((a, b) => {
      if (a.time == null && b.time == null) return 0;
      if (a.time == null) return 1;
      if (b.time == null) return -1;
      return a.time - b.time;
    });
    return out;
  }, [events, pins]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const fromT = from ? toTime(from) : null;
    const toT = to ? toTime(to) : null;
    return items.filter((it) => {
      if (kind !== 'all' && it.kind !== kind) return false;
      if (fromT != null && (it.time == null || it.time < fromT)) return false;
      if (toT != null && (it.time == null || it.time > toT)) return false;
      if (q) {
        const hay =
          it.kind === 'event'
            ? `${it.event.title} ${it.event.description ?? ''}`
            : `${it.pin.label ?? ''} ${it.pin.address ?? ''}`;
        if (!hay.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [items, query, kind, from, to]);

  // --- Playback ---------------------------------------------------------------
  // Scrub through the case in order: entries after the cursor are dimmed, the
  // cursor row is highlighted. `cursor === null` means playback is off.
  const [cursor, setCursor] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1100);
  const currentRef = useRef(null);

  useEffect(() => {
    if (!playing || cursor == null) return;
    if (cursor >= filtered.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(
      () => setCursor((c) => Math.min((c ?? 0) + 1, filtered.length - 1)),
      speed,
    );
    return () => clearTimeout(timer);
  }, [playing, cursor, speed, filtered.length]);

  useEffect(() => {
    if (cursor == null) return;
    currentRef.current?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [cursor]);

  const stopPlayback = () => {
    setPlaying(false);
    setCursor(null);
  };

  const startPlayback = () => {
    if (filtered.length === 0) return;
    setCursor((c) => (c == null || c >= filtered.length - 1 ? 0 : c));
    setPlaying(true);
  };

  // Filter changes invalidate the cursor position — stop playback.
  useEffect(() => {
    setPlaying(false);
    setCursor(null);
  }, [query, kind, from, to]);

  const currentItem = cursor == null ? null : filtered[cursor];

  const handleSave = (draft) => {
    if (modal?.event) updateEvent(modal.event.id, draft);
    else addEvent(draft);
    setModal(null);
  };

  return (
    <div className="timeline-tab">
      <div className="timeline-toolbar">
        <input
          type="search"
          className="timeline-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter the timeline…"
          aria-label="Filter timeline"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="all">All entries</option>
          <option value="event">Events</option>
          <option value="visit">Visits</option>
        </select>
        <label className="timeline-date">
          <span>From</span>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="timeline-date">
          <span>To</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
        {(query || kind !== 'all' || from || to) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              setQuery('');
              setKind('all');
              setFrom('');
              setTo('');
            }}
          >
            Clear
          </button>
        )}
        <button
          type="button"
          className="btn btn-primary btn-sm timeline-add"
          onClick={() => setModal({ event: null })}
        >
          + Event
        </button>
      </div>

      {filtered.length > 0 && (
        <div
          className="timeline-playback"
          role="group"
          aria-label="Timeline playback"
        >
          <button
            type="button"
            className="timeline-play-btn"
            onClick={playing ? () => setPlaying(false) : startPlayback}
            aria-label={playing ? 'Pause playback' : 'Play timeline'}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
            ) : (
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7 4.5v15l12-7.5z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="timeline-play-btn"
            onClick={() => {
              setPlaying(false);
              setCursor(0);
            }}
            aria-label="Restart playback"
            title="Restart"
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 12a9 9 0 1 0 2.6-6.36L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <input
            type="range"
            className="timeline-scrubber"
            min={0}
            max={Math.max(0, filtered.length - 1)}
            value={cursor ?? 0}
            onChange={(event) => {
              setPlaying(false);
              setCursor(Number(event.target.value));
            }}
            aria-label="Scrub timeline"
            disabled={filtered.length < 2}
          />
          <span className="timeline-playback-readout">
            {currentItem
              ? `${cursor + 1} / ${filtered.length} · ${formatWhen(
                  currentItem.date,
                  currentItem.time,
                )}`
              : `${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`}
          </span>
          <select
            className="timeline-speed"
            value={speed}
            onChange={(event) => setSpeed(Number(event.target.value))}
            aria-label="Playback speed"
          >
            <option value={1700}>Slow</option>
            <option value={1100}>Normal</option>
            <option value={600}>Fast</option>
          </select>
          {cursor != null && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={stopPlayback}
            >
              Stop
            </button>
          )}
        </div>
      )}

      <div className="timeline-body">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>Nothing on the timeline yet.</p>
            <p className="empty-hint">
              Add an event, or give a pin a “visited” date on the Map tab and it
              will appear here automatically.
            </p>
          </div>
        ) : (
          <ol className="timeline-list">
            {filtered.map((it, index) => {
              const conf =
                it.kind === 'event' ? it.event.confidence : it.pin.confidence;
              const state =
                cursor == null
                  ? ''
                  : index < cursor
                    ? ' is-past'
                    : index === cursor
                      ? ' is-current'
                      : ' is-future';
              return (
                <li
                  key={it.key}
                  ref={cursor === index ? currentRef : null}
                  className={`timeline-item ${it.kind}${state}`}
                >
                  <div className="timeline-when">
                    {formatWhen(it.date, it.time)}
                  </div>
                  <span className="timeline-dot" aria-hidden="true" />
                  <div className="timeline-content">
                    <div className="timeline-head">
                      <span className={`timeline-kind ${it.kind}`}>
                        {it.kind === 'event' ? 'Event' : 'Visit'}
                      </span>
                      <span className="timeline-title">
                        {it.kind === 'event'
                          ? it.event.title || 'Untitled event'
                          : it.pin.label || it.pin.address || 'Location'}
                      </span>
                      {conf && (
                        <span className="timeline-conf">
                          {confidenceLabel(conf)}
                        </span>
                      )}
                    </div>

                    {it.kind === 'event' && it.event.description && (
                      <p className="timeline-desc">{it.event.description}</p>
                    )}

                    {it.kind === 'event' && it.event.source && (
                      <a
                        className="timeline-source"
                        href={it.event.source}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {it.event.source}
                      </a>
                    )}

                    <div className="timeline-links">
                      {it.kind === 'event' && it.event.pinId && (
                        <button
                          type="button"
                          className="timeline-chip"
                          onClick={() => navigateToPin(it.event.pinId)}
                        >
                          {pinById.get(it.event.pinId)?.label || 'Location'}
                        </button>
                      )}
                      {it.kind === 'event' &&
                        (it.event.identifierIds ?? []).map((iid) => {
                          const ident = idById.get(iid);
                          if (!ident) return null;
                          return (
                            <button
                              key={iid}
                              type="button"
                              className="timeline-chip"
                              onClick={() => navigateToIdentifier(iid)}
                            >
                              <IdentifierBadge
                                typeKey={ident.type}
                                customIconId={ident.customIconId}
                                size="sm"
                              />
                              {getDisplayLabel(ident)}
                            </button>
                          );
                        })}
                      {it.kind === 'visit' && (
                        <button
                          type="button"
                          className="timeline-chip"
                          onClick={() => navigateToPin(it.pin.id)}
                        >
                          Show on map
                        </button>
                      )}
                    </div>

                    {it.kind === 'event' && (
                      <div className="timeline-actions">
                        <button
                          type="button"
                          onClick={() => setModal({ event: it.event })}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => {
                            if (confirm('Delete this event?'))
                              deleteEvent(it.event.id);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {modal && (
        <TimelineEventModal
          event={modal.event}
          pins={pins}
          identifiers={identifiers}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
