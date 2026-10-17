import { useMemo, useState } from 'react';
import {
  getTypeDef,
  getDisplayLabel,
  getSecondaryLabel,
} from '../identifierTypes.js';
import IdentifierBadge from './IdentifierBadge.jsx';
import {
  findDuplicateGroups,
  DUPLICATE_KIND_LABELS,
} from '../utils/mergeIdentifiers.js';
import './MergeModal.css';

function Row({ identifier, checked, onSelect, name }) {
  const def = getTypeDef(identifier.type);
  const secondary = getSecondaryLabel(identifier);
  return (
    <label className={`merge-row ${checked ? 'is-keeper' : ''}`}>
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onSelect}
        aria-label={`Keep ${getDisplayLabel(identifier)}`}
      />
      <IdentifierBadge
        typeKey={identifier.type}
        customIconId={identifier.customIconId}
        size="sm"
      />
      <span className="merge-row-body">
        <span className="merge-row-type">{def.label}</span>
        <span className="merge-row-label">{getDisplayLabel(identifier)}</span>
        {secondary && <span className="merge-row-secondary">{secondary}</span>}
      </span>
      {checked && <span className="merge-row-keep">Keep</span>}
    </label>
  );
}

/**
 * Entity merge + duplicate review.
 *
 * `selected` tab folds 2+ selected nodes into one keeper. `duplicates` tab
 * surfaces heuristic matches (shared email/phone/username/…) and lets you merge
 * each group. Either path records a single undo step via `onMerge`.
 */
export default function MergeModal({
  identifiers,
  initialSelection = [],
  initialTab,
  onClose,
  onMerge,
}) {
  const selected = useMemo(
    () => identifiers.filter((i) => initialSelection.includes(i.id)),
    [identifiers, initialSelection],
  );
  const groups = useMemo(() => findDuplicateGroups(identifiers), [identifiers]);

  const [tab, setTab] = useState(
    initialTab ?? (selected.length >= 2 ? 'selected' : 'duplicates'),
  );
  const [keeper, setKeeper] = useState(selected[0]?.id ?? null);
  const [groupKeepers, setGroupKeepers] = useState({});

  const handleMergeSelected = () => {
    if (!keeper || selected.length < 2) return;
    const removeIds = selected.map((i) => i.id).filter((id) => id !== keeper);
    onMerge(keeper, removeIds);
    onClose();
  };

  const handleMergeGroup = (group) => {
    const keepId = groupKeepers[group.key] ?? group.items[0].id;
    const removeIds = group.items
      .map((i) => i.id)
      .filter((id) => id !== keepId);
    if (removeIds.length === 0) return;
    onMerge(keepId, removeIds);
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal merge-modal" role="dialog" aria-modal="true">
        <h2>Merge identifiers</h2>
        <p className="modal-sub">
          Merging folds one node into another: missing fields are backfilled,
          notes are combined, and every link, pin, and timeline reference is
          moved onto the keeper. One Ctrl+Z undoes it.
        </p>

        <div className="merge-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'selected'}
            className={`merge-tab ${tab === 'selected' ? 'active' : ''}`}
            onClick={() => setTab('selected')}
            disabled={selected.length < 2}
          >
            Selected ({selected.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'duplicates'}
            className={`merge-tab ${tab === 'duplicates' ? 'active' : ''}`}
            onClick={() => setTab('duplicates')}
          >
            Suggested duplicates ({groups.length})
          </button>
        </div>

        {tab === 'selected' ? (
          <div className="merge-body">
            {selected.length < 2 ? (
              <p className="merge-empty">
                Select two or more nodes on the canvas to merge them.
              </p>
            ) : (
              <>
                <div className="merge-list" role="radiogroup">
                  {selected.map((id) => (
                    <Row
                      key={id.id}
                      identifier={id}
                      name="merge-keeper"
                      checked={keeper === id.id}
                      onSelect={() => setKeeper(id.id)}
                    />
                  ))}
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleMergeSelected}
                    disabled={!keeper}
                  >
                    Merge {selected.length} into keeper
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="merge-body">
            {groups.length === 0 ? (
              <p className="merge-empty">
                No likely duplicates found. Nodes are matched when they share an
                email, phone, username, handle, VIN, or plate.
              </p>
            ) : (
              <ul className="merge-groups">
                {groups.map((group) => {
                  const keepId = groupKeepers[group.key] ?? group.items[0].id;
                  return (
                    <li key={group.key} className="merge-group">
                      <div className="merge-group-head">
                        <span className="merge-group-kind">
                          {DUPLICATE_KIND_LABELS[group.kind] ?? group.kind}
                        </span>
                        <span className="merge-group-value">{group.value}</span>
                        <span className="merge-group-count">
                          {group.items.length} nodes
                        </span>
                      </div>
                      <div className="merge-list" role="radiogroup">
                        {group.items.map((id) => (
                          <Row
                            key={id.id}
                            identifier={id}
                            name={`merge-group-${group.key}`}
                            checked={keepId === id.id}
                            onSelect={() =>
                              setGroupKeepers((cur) => ({
                                ...cur,
                                [group.key]: id.id,
                              }))
                            }
                          />
                        ))}
                      </div>
                      <div className="merge-group-actions">
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleMergeGroup(group)}
                        >
                          Merge these
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
