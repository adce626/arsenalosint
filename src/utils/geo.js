/**
 * Pure geodesic helpers for the map measuring tools. Implemented without a
 * dependency so they can be unit-tested and reused by both providers.
 */

const EARTH_RADIUS_M = 6378137; // WGS-84 mean radius.

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Great-circle distance between two {lat, lng} points, in meters.
 */
export function haversineMeters(a, b) {
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Total length of a path of {lat, lng} points, in meters. */
export function pathLengthMeters(points) {
  let total = 0;
  for (let i = 1; i < points.length; i++) {
    total += haversineMeters(points[i - 1], points[i]);
  }
  return total;
}

/**
 * Area of a geodesic polygon (spherical excess approximation, matching the
 * well-known Google Maps `computeArea` algorithm), in square meters.
 */
export function ringAreaSquareMeters(points) {
  const n = points.length;
  if (n < 3) return 0;
  let total = 0;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    total +=
      toRadians(p2.lng - p1.lng) *
      (2 + Math.sin(toRadians(p1.lat)) + Math.sin(toRadians(p2.lat)));
  }
  return Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

export function formatDistance(meters) {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 10000 ? 2 : 1)} km`;
}

export function formatArea(squareMeters) {
  if (squareMeters < 10000) return `${Math.round(squareMeters)} m²`;
  const km2 = squareMeters / 1_000_000;
  return `${km2.toFixed(km2 < 10 ? 2 : 1)} km²`;
}
