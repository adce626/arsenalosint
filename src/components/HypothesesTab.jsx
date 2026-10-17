import { useMemo, useRef, useState } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import { getTypeDef, getDisplayLabel } from '../identifierTypes.js';
import {
  EVIDENCE_DIRECTIONS,
  EVIDENCE_STRENGTHS,
  scoreHypothesis,
  hypothesisVerdict,
  rankHypotheses,
} from '../utils/hypotheses.js';
import { useIntent } from '../utils/intentBus.js';
import './HypothesesTab.css';

const VERDICT_CLASS = {
  supported: 'is-supported',
  refuted: 'is-refuted',
  contested: 'is-contested',
  empty: 'is-empty',
};

export default function HypothesesTab() {
  const {
    project,
    addHypothesis,
    updateHypothesis,
    deleteHypothesis,
    addEvidence,
    updateEvidence,
    deleteEvidence,
  } = useProject();

  const hypotheses = useMemo(() => project?.hypotheses ?? [], [project]);
  const identifiers = useMemo(() => project?.identifiers ?? [], [project]);
  const ranked = useMemo(() => rankHypotheses(hypotheses), [hypotheses]);

  const [newTitle, setNewTitle] = useState('');
  const newTitleRef = useRef(null);
  useIntent('new-hypothesis', () => newTitleRef.current?.focus());

  const handleAdd = () => {
    const title = newTitle.trim();
    if (!title) return;
    addHypothesis({ title });
    setNewTitle('');
  };

  return (
    <div className="hypotheses-tab">
      <div className="hypotheses-inner">
        <header className="hypotheses-header">
          <div>
            <h2 className="hypotheses-title">
              Analysis of competing hypotheses
            </h2>
            <p className="hypotheses-sub">
              Write down each explanation, then attach the evidence that
              supports or refutes it. The score is the weighted balance of the
              evidence — a hedge against confirmation bias.
            </p>
          </div>
        </header>

        <div className="hypotheses-add">
          <input
            ref={newTitleRef}
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder="New hypothesis — e.g. “The account belongs to the subject”"
            aria-label="New hypothesis"
          />
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={!newTitle.trim()}
          >
            Add hypothesis
          </button>
        </div>

        {hypotheses.length === 0 ? (
          <div className="hypotheses-empty">
            <p>No hypotheses yet.</p>
            <p className="hypotheses-empty-hint">
              Start with two or three competing explanations of your key
              question, then add the evidence you have. The strongest-scoring
              hypothesis is not automatically the truth — it is the one your
              evidence best supports so far.
            </p>
          </div>
        ) : (
          <>
            {ranked.length >= 2 && (
              <section className="hypotheses-rank" aria-label="Ranked scores">
                {ranked.map(({ hypothesis, score }) => {
                  const verdict = hypothesisVerdict(hypothesis);
                  const max = Math.max(
                    3,
                    ...ranked.map((r) => Math.abs(r.score)),
                  );
                  const pct = (Math.abs(score) / max) * 50;
                  return (
                    <div key={hypothesis.id} className="rank-row">
                      <span className="rank-label">{hypothesis.title}</span>
                      <span className="rank-bar">
                        <span className="rank-bar-mid" />
                        <span
                          className={`rank-bar-fill ${VERDICT_CLASS[verdict.id]}`}
                          style={
                            score >= 0
                              ? { left: '50%', width: `${pct}%` }
                              : { right: '50%', width: `${pct}%` }
                          }
                        />
                      </span>
                      <span className="rank-score">
                        {score > 0 ? `+${score}` : score}
                      </span>
                    </div>
                  );
                })}
              </section>
            )}

            <div className="hypotheses-grid">
              {hypotheses.map((hypothesis) => (
                <HypothesisCard
                  key={hypothesis.id}
                  hypothesis={hypothesis}
                  identifiers={identifiers}
                  onUpdate={(patch) => updateHypothesis(hypothesis.id, patch)}
                  onDelete={() => {
                    if (
                      confirm(
                        `Delete hypothesis “${hypothesis.title}” and its evidence?`,
                      )
                    )
                      deleteHypothesis(hypothesis.id);
                  }}
                  onAddEvidence={(evidence) =>
                    addEvidence(hypothesis.id, evidence)
                  }
                  onUpdateEvidence={(evidenceId, patch) =>
                    updateEvidence(hypothesis.id, evidenceId, patch)
                  }
                  onDeleteEvidence={(evidenceId) =>
                    deleteEvidence(hypothesis.id, evidenceId)
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function HypothesisCard({
  hypothesis,
  identifiers,
  onUpdate,
  onDelete,
  onAddEvidence,
  onUpdateEvidence,
  onDeleteEvidence,
}) {
  const score = scoreHypothesis(hypothesis);
  const verdict = hypothesisVerdict(hypothesis);
  const evidence = hypothesis.evidence ?? [];
  const supports = evidence.filter((e) => e.direction !== 'refutes').length;
  const refutes = evidence.length - supports;

  return (
    <article className="hypothesis-card">
      <div className="hypothesis-card-head">
        <input
          className="hypothesis-title-input"
          defaultValue={hypothesis.title}
          onBlur={(e) => {
            const value = e.target.value.trim();
            if (value && value !== hypothesis.title) onUpdate({ title: value });
            else if (!value) e.target.value = hypothesis.title;
          }}
          aria-label="Hypothesis title"
        />
        <button
          type="button"
          className="icon-btn hypothesis-delete"
          onClick={onDelete}
          aria-label="Delete hypothesis"
          title="Delete hypothesis"
        >
          <svg
            width="15"
            height="15"
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
      </div>

      <textarea
        className="hypothesis-desc"
        defaultValue={hypothesis.description ?? ''}
        onBlur={(e) => onUpdate({ description: e.target.value })}
        rows={2}
        placeholder="Why this explanation is plausible…"
        aria-label="Hypothesis description"
      />

      <div className="hypothesis-meter">
        <span className={`verdict-badge ${VERDICT_CLASS[verdict.id]}`}>
          {verdict.label}
        </span>
        <span className="hypothesis-score">
          score {score > 0 ? `+${score}` : score}
        </span>
        <span className="hypothesis-counts">
          {supports} for · {refutes} against
        </span>
      </div>

      <ul className="evidence-list">
        {evidence.length === 0 && (
          <li className="evidence-empty">No evidence yet.</li>
        )}
        {evidence.map((e) => {
          const isRefute = e.direction === 'refutes';
          const linked = identifiers.find((i) => i.id === e.identifierId);
          return (
            <li
              key={e.id}
              className={`evidence-item ${isRefute ? 'is-refute' : 'is-support'}`}
            >
              <div className="evidence-row">
                <button
                  type="button"
                  className="evidence-dir"
                  onClick={() =>
                    onUpdateEvidence(e.id, {
                      direction: isRefute ? 'supports' : 'refutes',
                    })
                  }
                  title="Toggle support / refute"
                >
                  {isRefute ? '−' : '+'}
                </button>
                <select
                  className="evidence-strength"
                  value={e.strength ?? 'moderate'}
                  onChange={(ev) =>
                    onUpdateEvidence(e.id, { strength: ev.target.value })
                  }
                  aria-label="Evidence strength"
                >
                  {EVIDENCE_STRENGTHS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <input
                  className="evidence-text"
                  defaultValue={e.text}
                  onBlur={(ev) => {
                    const value = ev.target.value.trim();
                    if (value && value !== e.text)
                      onUpdateEvidence(e.id, { text: value });
                  }}
                  placeholder="What does this evidence say?"
                  aria-label="Evidence text"
                />
                <button
                  type="button"
                  className="icon-btn evidence-remove"
                  onClick={() => onDeleteEvidence(e.id)}
                  aria-label="Delete evidence"
                  title="Delete evidence"
                >
                  <svg
                    width="13"
                    height="13"
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
              <div className="evidence-meta">
                <select
                  className="evidence-link"
                  value={e.identifierId ?? ''}
                  onChange={(ev) =>
                    onUpdateEvidence(e.id, {
                      identifierId: ev.target.value || null,
                    })
                  }
                  aria-label="Linked identifier"
                >
                  <option value="">Link to identifier…</option>
                  {identifiers.map((i) => (
                    <option key={i.id} value={i.id}>
                      {getTypeDef(i.type).label}: {getDisplayLabel(i)}
                    </option>
                  ))}
                </select>
                <input
                  className="evidence-source"
                  defaultValue={e.source ?? ''}
                  onBlur={(ev) => {
                    const value = ev.target.value.trim();
                    if (value !== (e.source ?? ''))
                      onUpdateEvidence(e.id, { source: value });
                  }}
                  placeholder="Source URL"
                  aria-label="Evidence source URL"
                />
                {linked && (
                  <span className="evidence-linked">
                    linked: {getDisplayLabel(linked)}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <EvidenceComposer identifiers={identifiers} onAdd={onAddEvidence} />
    </article>
  );
}

function EvidenceComposer({ identifiers, onAdd }) {
  const [text, setText] = useState('');
  const [direction, setDirection] = useState('supports');
  const [strength, setStrength] = useState('moderate');
  const [identifierId, setIdentifierId] = useState('');

  const submit = () => {
    const value = text.trim();
    if (!value) return;
    onAdd({
      text: value,
      direction,
      strength,
      identifierId: identifierId || null,
    });
    setText('');
    setIdentifierId('');
  };

  return (
    <div className="evidence-composer">
      <select
        value={direction}
        onChange={(e) => setDirection(e.target.value)}
        aria-label="New evidence direction"
      >
        {EVIDENCE_DIRECTIONS.map((d) => (
          <option key={d.id} value={d.id}>
            {d.label}
          </option>
        ))}
      </select>
      <select
        value={strength}
        onChange={(e) => setStrength(e.target.value)}
        aria-label="New evidence strength"
      >
        {EVIDENCE_STRENGTHS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') submit();
        }}
        placeholder="Add evidence…"
        aria-label="New evidence text"
      />
      {identifiers.length > 0 && (
        <select
          value={identifierId}
          onChange={(e) => setIdentifierId(e.target.value)}
          aria-label="Link new evidence to identifier"
        >
          <option value="">No link</option>
          {identifiers.map((i) => (
            <option key={i.id} value={i.id}>
              {getDisplayLabel(i)}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={submit}
        disabled={!text.trim()}
      >
        Add
      </button>
    </div>
  );
}
