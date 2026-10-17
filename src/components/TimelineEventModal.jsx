import { useMemo, useState } from 'react';
import { getTypeDef, getDisplayLabel } from '../identifierTypes.js';
import { CONFIDENCE_LEVELS } from '../confidence.js';
import IdentifierBadge from './IdentifierBadge.jsx';
import SourceGrading from './SourceGrading.jsx';
import './TimelineEventModal.css';

export default function TimelineEventModal({
  event,
  pins,
  identifiers,
  onClose,
  onSave,
}) {
  const [date, setDate] = useState(event?.date ?? '');
  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [source, setSource] = useState(event?.source ?? '');
  const [confidence, setConfidence] = useState(event?.confidence ?? '');
  const [reliability, setReliability] = useState(event?.reliability ?? '');
  const [credibility, setCredibility] = useState(event?.credibility ?? '');
  const [pinId, setPinId] = useState(event?.pinId ?? '');
  const [selectedIds, setSelectedIds] = useState(
    () => new Set(event?.identifierIds ?? []),
  );
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const filteredIdentifiers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return identifiers;
    return identifiers.filter((i) =>
      `${getTypeDef(i.type).label} ${getDisplayLabel(i)}`
        .toLowerCase()
        .includes(q),
    );
  }, [identifiers, search]);

  const toggleId = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('A title is required.');
      return;
    }
    onSave({
      date,
      title: title.trim(),
      description: description.trim(),
      source: source.trim(),
      confidence,
      reliability,
      credibility,
      pinId: pinId || null,
      identifierIds: [...selectedIds],
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal timeline-event-modal"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div className="modal-header">
          <h2>{event ? 'Edit event' : 'New event'}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Close"
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
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="field-row">
          <div className="field">
            <label htmlFor="ev-date">Date</label>
            <input
              id="ev-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="ev-confidence">Confidence</label>
            <select
              id="ev-confidence"
              value={confidence}
              onChange={(e) => setConfidence(e.target.value)}
            >
              {CONFIDENCE_LEVELS.map((l) => (
                <option key={l.id || 'none'} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="ev-title">Title</label>
          <input
            id="ev-title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Posted a photo at the harbour"
          />
        </div>

        <div className="field">
          <label htmlFor="ev-desc">Description</label>
          <textarea
            id="ev-desc"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What happened, and why it matters."
          />
        </div>

        <div className="field">
          <label htmlFor="ev-source">Source URL</label>
          <input
            id="ev-source"
            type="url"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="https://…"
          />
        </div>

        <SourceGrading
          reliability={reliability}
          credibility={credibility}
          onChange={(patch) => {
            if ('reliability' in patch) setReliability(patch.reliability);
            if ('credibility' in patch) setCredibility(patch.credibility);
          }}
        />

        <div className="field">
          <label htmlFor="ev-pin">Location</label>
          <select
            id="ev-pin"
            value={pinId ?? ''}
            onChange={(e) => setPinId(e.target.value)}
          >
            <option value="">None</option>
            {pins.map((p, idx) => (
              <option key={p.id} value={p.id}>
                {p.label?.trim() || p.address?.trim() || `Pin ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>People &amp; identifiers</label>
          {identifiers.length === 0 ? (
            <p className="timeline-event-hint">
              No identifiers yet. Add some on the Information tab.
            </p>
          ) : (
            <>
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search identifiers…"
                className="timeline-event-search"
                aria-label="Search identifiers"
              />
              <div className="timeline-event-identifiers">
                {filteredIdentifiers.map((i) => (
                  <label key={i.id} className="timeline-event-id-row">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(i.id)}
                      onChange={() => toggleId(i.id)}
                    />
                    <IdentifierBadge
                      typeKey={i.type}
                      customIconId={i.customIconId}
                      size="sm"
                    />
                    <span>{getDisplayLabel(i)}</span>
                  </label>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {event ? 'Save event' : 'Add event'}
          </button>
        </div>
      </form>
    </div>
  );
}
