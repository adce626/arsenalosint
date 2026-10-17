import { describe, it, expect } from 'vitest';
import {
  pinsToGeoJSON,
  pinsToKML,
  pinsToCSV,
  parseGeoJSON,
  parseKML,
  parseCSV,
  parseGeoFile,
} from './geoFormats';

const PINS = [
  {
    id: 'p1',
    label: 'Safe house',
    address: '10 Downing St, London',
    lat: 51.5034,
    lng: -0.1276,
    confidence: 'high',
    source: 'https://example.org/a',
    notes: 'Observed at dusk',
  },
  {
    id: 'p2',
    label: 'Café, "the corner"',
    address: 'Rue de Rivoli',
    lat: 48.8566,
    lng: 2.3522,
    confidence: '',
    source: '',
    notes: 'Line one\nLine two',
  },
];

describe('geoFormats round-trips', () => {
  it('exports and re-imports GeoJSON', () => {
    const records = parseGeoJSON(pinsToGeoJSON(PINS));
    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      label: 'Safe house',
      lat: 51.5034,
      lng: -0.1276,
      confidence: 'high',
    });
    expect(records[1].notes).toBe('Line one\nLine two');
  });

  it('exports and re-imports KML', () => {
    const records = parseKML(pinsToKML(PINS));
    expect(records).toHaveLength(2);
    expect(records[0].label).toBe('Safe house');
    expect(records[0].lat).toBeCloseTo(51.5034, 4);
    expect(records[0].lng).toBeCloseTo(-0.1276, 4);
    expect(records[0].source).toBe('https://example.org/a');
  });

  it('exports and re-imports CSV with tricky cell values', () => {
    const records = parseCSV(pinsToCSV(PINS));
    expect(records).toHaveLength(2);
    expect(records[1].label).toBe('Café, "the corner"');
    expect(records[1].notes).toBe('Line one\nLine two');
    expect(records[0].lat).toBe(51.5034);
  });

  it('dispatches by extension in parseGeoFile', () => {
    expect(parseGeoFile('x.geojson', pinsToGeoJSON(PINS))).toHaveLength(2);
    expect(parseGeoFile('x.kml', pinsToKML(PINS))).toHaveLength(2);
    expect(parseGeoFile('x.csv', pinsToCSV(PINS))).toHaveLength(2);
  });

  it('throws on unusable input', () => {
    expect(() => parseGeoJSON('not json')).toThrow(/valid JSON/);
    expect(() =>
      parseGeoJSON('{"type":"FeatureCollection","features":[]}'),
    ).toThrow(/No Point features/);
    expect(() => parseCSV('a,b\n1,2')).toThrow(/lat.*lng/);
    expect(() => parseKML('<not-kml>')).toThrow();
  });
});
