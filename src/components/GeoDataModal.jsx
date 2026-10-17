import { useRef, useState } from 'react';
import { useProject } from '../context/ProjectContext.jsx';
import {
  pinsToGeoJSON,
  pinsToKML,
  pinsToCSV,
  parseGeoFile,
  downloadText,
  safeFileStem,
  MAX_IMPORT_PINS,
} from '../utils/geoFormats.js';
import './GeoDataModal.css';

const FORMATS = [
  {
    id: 'geojson',
    label: 'GeoJSON',
    hint: 'QGIS, Mapbox, web maps',
    ext: 'geojson',
    mime: 'application/geo+json',
    build: pinsToGeoJSON,
  },
  {
    id: 'kml',
    label: 'KML',
    hint: 'Google Earth, Google Maps',
    ext: 'kml',
    mime: 'application/vnd.google-earth.kml+xml',
    build: pinsToKML,
  },
  {
    id: 'csv',
    label: 'CSV',
    hint: 'Excel, Sheets, databases',
    ext: 'csv',
    mime: 'text/csv',
    build: pinsToCSV,
  },
];

export default function GeoDataModal({ onClose }) {
  const { project, addPin } = useProject();
  const pins = project?.locations ?? [];
  const fileInputRef = useRef(null);

  const [preview, setPreview] = useState(null); // { records }
  const [error, setError] = useState('');

  const handleExport = (format) => {
    const stem = safeFileStem(project?.name ?? '');
    downloadText(
      `${stem}-locations.${format.ext}`,
      format.build(pins),
      format.mime,
    );
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    try {
      const raw = await file.text();
      const records = parseGeoFile(file.name, raw).slice(0, MAX_IMPORT_PINS);
      if (records.length === 0) throw new Error('No usable points found.');
      setPreview(records);
    } catch (err) {
      setPreview(null);
      setError(err?.message ?? 'Could not read that file.');
    }
  };

  const confirmImport = () => {
    if (!preview) return;
    for (const record of preview) addPin(record);
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal geo-data-modal" role="dialog" aria-modal="true">
        <h2>Import / export locations</h2>
        <p className="modal-sub">
          Move pins between the workspace and mapping tools. Exports use the{' '}
          {pins.length} location{pins.length === 1 ? '' : 's'} currently on the
          map.
        </p>

        <section className="geo-section">
          <h3 className="geo-section-title">Export</h3>
          <div className="geo-export-row">
            {FORMATS.map((format) => (
              <button
                key={format.id}
                type="button"
                className="geo-format-btn"
                onClick={() => handleExport(format)}
                disabled={pins.length === 0}
              >
                <span className="geo-format-label">{format.label}</span>
                <span className="geo-format-hint">{format.hint}</span>
              </button>
            ))}
          </div>
          {pins.length === 0 && (
            <p className="geo-muted">Add a location to enable exports.</p>
          )}
        </section>

        <section className="geo-section">
          <h3 className="geo-section-title">Import</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept=".geojson,.json,.kml,.csv,application/geo+json,application/vnd.google-earth.kml+xml,text/csv"
            className="geo-file-input"
            onChange={handleFile}
          />
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose a file…
          </button>
          <span className="geo-muted"> GeoJSON, KML, or CSV with lat/lng.</span>

          {error && <p className="geo-error">{error}</p>}

          {preview && (
            <div className="geo-preview">
              <div className="geo-preview-head">
                <span>
                  <strong>{preview.length}</strong> location
                  {preview.length === 1 ? '' : 's'} ready to import
                </span>
                <button
                  type="button"
                  className="geo-preview-clear"
                  onClick={() => setPreview(null)}
                >
                  Clear
                </button>
              </div>
              <ul className="geo-preview-list">
                {preview.slice(0, 8).map((r, i) => (
                  <li key={`${r.lat}:${r.lng}:${i}`}>
                    <span className="geo-preview-label">
                      {r.label || r.address || 'Unnamed pin'}
                    </span>
                    <span className="geo-preview-coords">
                      {r.lat.toFixed(4)}, {r.lng.toFixed(4)}
                    </span>
                  </li>
                ))}
                {preview.length > 8 && (
                  <li className="geo-muted">…and {preview.length - 8} more</li>
                )}
              </ul>
            </div>
          )}
        </section>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
          {preview && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmImport}
            >
              Import {preview.length}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
