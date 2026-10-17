/**
 * Location import/export in interchange formats: GeoJSON, KML, and CSV.
 *
 * Export turns the project's pin records into a plain-text document. Import
 * parses each format into the loose record shape accepted by `addPin`
 * (label, address, lat, lng, notes, confidence, source, archivedUrl,
 * visitedAt, withWho, color, iconId). Everything is browser-only — no I/O
 * outside a Blob download and a File text read.
 */

const CSV_COLUMNS = [
  'label',
  'address',
  'lat',
  'lng',
  'confidence',
  'source',
  'archivedUrl',
  'visitedAt',
  'withWho',
  'notes',
];

export const MAX_IMPORT_PINS = 5000;

function text(value) {
  if (value === undefined || value === null) return '';
  return String(value);
}

function finite(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

// --- Export -----------------------------------------------------------------

export function pinsToGeoJSON(pins = []) {
  return JSON.stringify(
    {
      type: 'FeatureCollection',
      generator: 'ARSENAL OSINT',
      features: pins.map((pin) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [Number(pin.lng), Number(pin.lat)],
        },
        properties: {
          label: text(pin.label),
          address: text(pin.address),
          confidence: text(pin.confidence),
          source: text(pin.source),
          archivedUrl: text(pin.archivedUrl),
          visitedAt: text(pin.visitedAt),
          withWho: text(pin.withWho),
          notes: text(pin.notes),
        },
      })),
    },
    null,
    2,
  );
}

function escapeXml(value) {
  return text(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function pinsToKML(pins = []) {
  const placemarks = pins
    .map((pin) => {
      const name = escapeXml(pin.label || pin.address || 'Pin');
      const descriptionParts = [
        pin.address ? `Address: ${pin.address}` : '',
        pin.confidence ? `Confidence: ${pin.confidence}` : '',
        pin.source ? `Source: ${pin.source}` : '',
        pin.visitedAt ? `Visited: ${pin.visitedAt}` : '',
        pin.withWho ? `With: ${pin.withWho}` : '',
        pin.notes ? `Notes: ${pin.notes}` : '',
      ].filter(Boolean);
      const description = escapeXml(descriptionParts.join(' | '));
      return `    <Placemark>
      <name>${name}</name>
      <description>${description}</description>
      <ExtendedData>
        <Data name="confidence"><value>${escapeXml(pin.confidence)}</value></Data>
        <Data name="source"><value>${escapeXml(pin.source)}</value></Data>
        <Data name="archivedUrl"><value>${escapeXml(pin.archivedUrl)}</value></Data>
      </ExtendedData>
      <Point><coordinates>${Number(pin.lng)},${Number(pin.lat)},0</coordinates></Point>
    </Placemark>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>ARSENAL OSINT export</name>
${placemarks}
  </Document>
</kml>
`;
}

function csvCell(value) {
  const s = text(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function pinsToCSV(pins = []) {
  const header = CSV_COLUMNS.join(',');
  const rows = pins.map((pin) =>
    CSV_COLUMNS.map((col) => csvCell(pin[col])).join(','),
  );
  return [header, ...rows].join('\n') + '\n';
}

// --- Import -----------------------------------------------------------------

function recordFromProps(props, lat, lng) {
  return {
    label: text(props.label ?? props.name).trim(),
    address: text(props.address).trim(),
    lat,
    lng,
    confidence: text(props.confidence).trim(),
    source: text(props.source).trim(),
    archivedUrl: text(props.archivedUrl).trim(),
    visitedAt: text(props.visitedAt ?? props.visited).trim(),
    withWho: text(props.withWho).trim(),
    notes: text(props.notes ?? props.description).trim(),
  };
}

function coerceFeature(feature) {
  if (!feature || feature.type !== 'Feature') return null;
  const geom = feature.geometry ?? {};
  if (geom.type !== 'Point' || !Array.isArray(geom.coordinates)) return null;
  const [lng, lat] = geom.coordinates;
  const flat = finite(lat);
  const flng = finite(lng);
  if (flat === null || flng === null) return null;
  return recordFromProps(feature.properties ?? {}, flat, flng);
}

export function parseGeoJSON(rawText) {
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  const features = Array.isArray(data?.features)
    ? data.features
    : data?.type === 'Feature'
      ? [data]
      : [];
  const records = features.map(coerceFeature).filter(Boolean);
  if (records.length === 0)
    throw new Error('No Point features found in the GeoJSON.');
  return records;
}

export function parseKML(rawText) {
  if (typeof DOMParser === 'undefined')
    throw new Error('KML import needs a browser environment.');
  const doc = new DOMParser().parseFromString(rawText, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length > 0)
    throw new Error('That file is not valid XML/KML.');

  const placemarks = doc.getElementsByTagNameNS('*', 'Placemark');
  const records = [];
  for (const placemark of placemarks) {
    const coordEl = placemark.getElementsByTagNameNS('*', 'coordinates')[0];
    if (!coordEl) continue;
    const [lngRaw, latRaw] = text(coordEl.textContent).trim().split(',');
    const lat = finite(latRaw);
    const lng = finite(lngRaw);
    if (lat === null || lng === null) continue;

    const nameEl = placemark.getElementsByTagNameNS('*', 'name')[0];
    const descEl = placemark.getElementsByTagNameNS('*', 'description')[0];
    const props = {
      name: nameEl?.textContent?.trim() ?? '',
      description: descEl?.textContent?.trim() ?? '',
    };
    // ExtendedData <Data name="…"><value>…</value></Data>
    const dataEls = placemark.getElementsByTagNameNS('*', 'Data');
    for (const dataEl of dataEls) {
      const key = dataEl.getAttribute('name');
      const value = dataEl.getElementsByTagNameNS('*', 'value')[0];
      if (key && value) props[key] = value.textContent?.trim() ?? '';
    }
    records.push(recordFromProps(props, lat, lng));
  }
  if (records.length === 0)
    throw new Error('No Placemark points found in the KML.');
  return records;
}

/** Minimal RFC-4180-ish CSV parser (handles quoted cells + embedded commas). */
function parseCSVRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell);
      cell = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}

export function parseCSV(rawText) {
  const rows = parseCSVRows(rawText);
  if (rows.length < 2) throw new Error('The CSV has no data rows.');
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name) => header.indexOf(name.toLowerCase());

  const latIdx = idx('lat') !== -1 ? idx('lat') : idx('latitude');
  const lngIdx = idx('lng') !== -1 ? idx('lng') : idx('longitude');
  if (latIdx === -1 || lngIdx === -1)
    throw new Error('The CSV needs "lat" and "lng" columns.');

  const records = [];
  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const lat = finite(cells[latIdx]);
    const lng = finite(cells[lngIdx]);
    if (lat === null || lng === null) continue;
    const props = {};
    for (const col of CSV_COLUMNS) {
      const ci = idx(col);
      if (ci !== -1) props[col] = cells[ci];
    }
    records.push(recordFromProps(props, lat, lng));
  }
  if (records.length === 0)
    throw new Error('No rows with a valid latitude and longitude.');
  return records;
}

/** Dispatch on file extension / content sniffing. */
export function parseGeoFile(filename, rawText) {
  const lower = (filename ?? '').toLowerCase();
  if (lower.endsWith('.kml')) return parseKML(rawText);
  if (lower.endsWith('.csv')) return parseCSV(rawText);
  if (lower.endsWith('.geojson') || lower.endsWith('.json'))
    return parseGeoJSON(rawText);
  // Sniff: XML/KML vs JSON vs CSV.
  const trimmed = rawText.trimStart();
  if (trimmed.startsWith('<')) return parseKML(rawText);
  if (trimmed.startsWith('{') || trimmed.startsWith('['))
    return parseGeoJSON(rawText);
  return parseCSV(rawText);
}

// --- Download ---------------------------------------------------------------

export function downloadText(filename, contents, mime = 'text/plain') {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function safeFileStem(name) {
  const base = text(name)
    .trim()
    .replace(/[^\w.-]+/g, '-');
  return base.replace(/^-+|-+$/g, '') || 'project';
}
