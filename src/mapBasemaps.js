/**
 * Basemap (map-tile style) definitions shared by both map implementations.
 *
 * The OSM/Leaflet tab consumes `url` (+ optional `overlay` labels tiles).
 * The Google tab consumes `googleMapTypeId`. Both tabs read/write the same
 * persisted choice so the app remembers the user's preferred basemap.
 *
 * Keeping this declarative means adding a provider later is a one-line entry.
 */

export const BASEMAPS = [
  {
    id: 'streets',
    label: 'Streets',
    hint: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    googleMapTypeId: 'roadmap',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    hint: 'Esri World Imagery',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
    googleMapTypeId: 'satellite',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    hint: 'Satellite + labels',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
    // Reference labels drawn on top of the imagery.
    overlay: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      attribution: 'Labels &copy; Esri',
    },
    maxZoom: 19,
    googleMapTypeId: 'hybrid',
  },
  {
    id: 'terrain',
    label: 'Terrain',
    hint: 'OpenTopoMap',
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution:
      'Map data &copy; OpenStreetMap, SRTM &middot; style &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    maxZoom: 17,
    googleMapTypeId: 'terrain',
  },
  {
    id: 'dark',
    label: 'Dark',
    hint: 'CARTO',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    googleMapTypeId: 'roadmap',
  },
  {
    id: 'light',
    label: 'Light',
    hint: 'CARTO',
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    googleMapTypeId: 'roadmap',
  },
];

export const BASEMAP_IDS = BASEMAPS.map((b) => b.id);
export const DEFAULT_BASEMAP_ID = 'streets';

export function getBasemap(id) {
  return BASEMAPS.find((b) => b.id === id) ?? BASEMAPS[0];
}

// Persisted so the chosen basemap survives reloads (client-only usage).
const STORAGE_KEY = 'osint-tool:basemap';

export function readBasemapId() {
  if (typeof window === 'undefined') return DEFAULT_BASEMAP_ID;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return BASEMAP_IDS.includes(stored) ? stored : DEFAULT_BASEMAP_ID;
}

export function writeBasemapId(id) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // Ignore storage failures — the choice still works for the session.
  }
}
