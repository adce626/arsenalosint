import { useMemo, useState } from 'react';
import { getPrimaryFieldKey, getTypeDef } from '../identifierTypes.js';
import './BulkImportModal.css';

// Platforms a bare username could belong to. Order mirrors the picker.
const USERNAME_PLATFORMS = [
  'instagram',
  'facebook',
  'twitter',
  'tiktok',
  'linkedin',
  'snapchat',
  'reddit',
  'discord',
  'telegram',
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s().-]{5,}$/;

function detectKind(value) {
  if (EMAIL_RE.test(value)) return 'email';
  const digits = (value.match(/\d/g) || []).length;
  if (digits >= 7 && PHONE_RE.test(value)) return 'phone';
  return 'username';
}

function parseLines(text) {
  return Array.from(
    new Set(
      text
        .split(/[\n,;]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

/**
 * Paste-a-list importer. Detects emails / phone numbers / usernames per line
 * and turns each into an identifier node. Usernames are attached to a
 * user-chosen platform (a bare handle has no inherent type).
 */
export default function BulkImportModal({ onClose, onCreate, existing = [] }) {
  const [text, setText] = useState('');
  const [platform, setPlatform] = useState('instagram');

  const entries = useMemo(() => {
    const existingKeys = new Set(
      existing.map(
        (id) =>
          `${id.type}:${String(id.fields?.[getPrimaryFieldKey(id.type)] ?? '').toLowerCase()}`,
      ),
    );
    const seen = new Set();
    const out = [];
    for (const raw of parseLines(text)) {
      const value = raw.replace(/^@/, '');
      const kind = detectKind(value);
      let type;
      let fields;
      if (kind === 'email') {
        type = 'email';
        fields = { address: value };
      } else if (kind === 'phone') {
        type = 'phone';
        fields = { number: value };
      } else {
        type = platform;
        fields = { [getPrimaryFieldKey(platform)]: value };
      }
      const key = `${type}:${String(fields[getPrimaryFieldKey(type)] ?? '').toLowerCase()}`;
      if (seen.has(key) || existingKeys.has(key)) continue;
      seen.add(key);
      out.push({ value, kind, type, fields });
    }
    return out;
  }, [text, platform, existing]);

  const countByKind = useMemo(() => {
    const counts = { email: 0, phone: 0, username: 0 };
    for (const e of entries) counts[e.kind] += 1;
    return counts;
  }, [entries]);

  const handleImport = () => {
    if (entries.length === 0) return;
    onCreate(entries.map((e) => ({ type: e.type, fields: e.fields })));
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal bulk-import-modal" role="dialog" aria-modal="true">
        <h2>Bulk import</h2>
        <p className="modal-sub">
          Paste one email, phone number, or username per line. Emails and phones
          are auto-detected; usernames are added to the platform you pick.
        </p>

        <div className="bulk-import-platform">
          <label htmlFor="bulk-platform">Usernames belong to</label>
          <select
            id="bulk-platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {USERNAME_PLATFORMS.map((t) => (
              <option key={t} value={t}>
                {getTypeDef(t).label}
              </option>
            ))}
          </select>
        </div>

        <textarea
          className="bulk-import-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={'jane@example.com\n+1 555 555 5555\n@janedoe'}
          aria-label="Values to import"
          autoFocus
        />

        <div className="bulk-import-summary">
          {text.trim() === '' ? (
            <span className="bulk-import-muted">Nothing to import yet.</span>
          ) : (
            <>
              <span>{countByKind.email} email</span>
              <span>{countByKind.phone} phone</span>
              <span>
                {countByKind.username}{' '}
                {getTypeDef(platform).label.toLowerCase()}
              </span>
              <span className="bulk-import-total">
                {entries.length} node{entries.length === 1 ? '' : 's'}
              </span>
            </>
          )}
        </div>

        {entries.length > 0 && (
          <ul className="bulk-import-preview">
            {entries.slice(0, 50).map((e, i) => (
              <li key={`${e.type}:${e.value}:${i}`}>
                <span className="bulk-import-badge">
                  {getTypeDef(e.type).label}
                </span>
                <span className="bulk-import-value">{e.value}</span>
              </li>
            ))}
            {entries.length > 50 && (
              <li className="bulk-import-muted">
                …and {entries.length - 50} more
              </li>
            )}
          </ul>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleImport}
            disabled={entries.length === 0}
          >
            Import {entries.length > 0 ? entries.length : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
