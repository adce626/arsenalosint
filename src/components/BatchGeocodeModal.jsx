import { useMemo, useRef, useState } from 'react';
import './BatchGeocodeModal.css';

const NOMINATIM = 'https://nominatim.openstreetmap.org/search';
// Nominatim's usage policy asks for at most one request per second.
const THROTTLE_MS = 1100;

function parseAddresses(text) {
  return Array.from(
    new Set(
      text
        .split(/\r?\n/)
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  );
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Geocode a pasted list of addresses via Nominatim and drop a pin for each
 * hit. Requests are throttled to respect the public API's rate limit.
 */
export default function BatchGeocodeModal({ onClose, onAdd }) {
  const [text, setText] = useState('');
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState([]);
  const cancelRef = useRef(false);

  const addresses = useMemo(() => parseAddresses(text), [text]);
  const okCount = results.filter((r) => r.status === 'ok').length;

  const run = async () => {
    if (addresses.length === 0) return;
    cancelRef.current = false;
    setRunning(true);
    setResults([]);
    const total = addresses.length;
    setProgress({ done: 0, total });
    const collected = [];
    for (let i = 0; i < total; i++) {
      if (cancelRef.current) break;
      const address = addresses[i];
      try {
        const res = await fetch(
          `${NOMINATIM}?format=jsonv2&limit=1&q=${encodeURIComponent(address)}`,
          { headers: { Accept: 'application/json' } },
        );
        const data = res.ok ? await res.json() : [];
        const hit = Array.isArray(data) ? data[0] : null;
        const lat = hit ? parseFloat(hit.lat) : NaN;
        const lng = hit ? parseFloat(hit.lon) : NaN;
        if (hit && Number.isFinite(lat) && Number.isFinite(lng)) {
          onAdd({
            lat,
            lng,
            label: hit.namedetails?.name ?? address.split(',')[0],
            address: hit.display_name ?? address,
          });
          collected.push({ address, status: 'ok' });
        } else {
          collected.push({ address, status: 'notfound' });
        }
      } catch {
        collected.push({ address, status: 'error' });
      }
      setResults([...collected]);
      setProgress({ done: i + 1, total });
      if (i < total - 1 && !cancelRef.current) await sleep(THROTTLE_MS);
    }
    setRunning(false);
  };

  const requestClose = () => {
    cancelRef.current = true;
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !running) requestClose();
      }}
    >
      <div
        className="modal batch-geocode-modal"
        role="dialog"
        aria-modal="true"
      >
        <h2>Batch geocode</h2>
        <p className="modal-sub">
          Paste one address per line. Each is looked up on OpenStreetMap
          (Nominatim) and added as a pin — throttled to one request per second.
        </p>

        <textarea
          className="batch-geocode-textarea"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder={
            '1600 Amphitheatre Parkway, Mountain View\nBrandenburg Gate, Berlin'
          }
          aria-label="Addresses to geocode"
          disabled={running}
          autoFocus
        />

        {running || results.length > 0 ? (
          <div className="batch-geocode-progress">
            <div className="batch-geocode-bar">
              <div
                className="batch-geocode-bar-fill"
                style={{
                  width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="batch-geocode-count">
              {progress.done}/{progress.total} · {okCount} placed
            </span>
          </div>
        ) : (
          <div className="batch-geocode-progress-count">
            {addresses.length} address{addresses.length === 1 ? '' : 'es'}
          </div>
        )}

        {results.length > 0 && (
          <ul className="batch-geocode-results">
            {results.map((r, i) => (
              <li key={`${r.address}-${i}`}>
                <span
                  className={`batch-geocode-status ${r.status}`}
                  aria-hidden="true"
                />
                <span className="batch-geocode-address">{r.address}</span>
                <span className="batch-geocode-verdict">
                  {r.status === 'ok'
                    ? 'added'
                    : r.status === 'notfound'
                      ? 'not found'
                      : 'error'}
                </span>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={requestClose}
          >
            {running ? 'Stop' : 'Close'}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={run}
            disabled={running || addresses.length === 0}
          >
            {running
              ? 'Geocoding…'
              : `Geocode ${addresses.length || ''}`.trim()}
          </button>
        </div>
      </div>
    </div>
  );
}
