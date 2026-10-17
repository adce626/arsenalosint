import { describe, expect, it } from 'vitest';
import {
  formatArea,
  formatDistance,
  haversineMeters,
  pathLengthMeters,
  ringAreaSquareMeters,
} from './geo';

describe('haversineMeters', () => {
  it('measures one degree of longitude at the equator (~111 km)', () => {
    const d = haversineMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(d).toBeGreaterThan(111000);
    expect(d).toBeLessThan(111600);
  });

  it('is zero for identical points', () => {
    expect(haversineMeters({ lat: 10, lng: 20 }, { lat: 10, lng: 20 })).toBe(0);
  });
});

describe('pathLengthMeters', () => {
  it('sums consecutive segments', () => {
    const len = pathLengthMeters([
      { lat: 0, lng: 0 },
      { lat: 0, lng: 1 },
      { lat: 0, lng: 2 },
    ]);
    expect(len).toBeGreaterThan(222000);
    expect(len).toBeLessThan(223500);
  });
});

describe('ringAreaSquareMeters', () => {
  it('returns 0 for fewer than three points', () => {
    expect(ringAreaSquareMeters([{ lat: 0, lng: 0 }])).toBe(0);
  });

  it('computes a plausible area for a 0.1° square', () => {
    const area = ringAreaSquareMeters([
      { lat: 0, lng: 0 },
      { lat: 0, lng: 0.1 },
      { lat: 0.1, lng: 0.1 },
      { lat: 0.1, lng: 0 },
    ]);
    // ~11.1 km per side → ~1.24e8 m².
    expect(area).toBeGreaterThan(1.2e8);
    expect(area).toBeLessThan(1.3e8);
  });
});

describe('formatters', () => {
  it('formats distances in m and km', () => {
    expect(formatDistance(250)).toBe('250 m');
    expect(formatDistance(2500)).toBe('2.50 km');
  });

  it('formats areas in m² and km²', () => {
    expect(formatArea(500)).toBe('500 m²');
    expect(formatArea(2_500_000)).toBe('2.50 km²');
  });
});
