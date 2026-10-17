/* Offline-capable service worker for the OSINT Arsenal shell.
 *
 * Strategy:
 *   - Navigations (HTML): network-first, so a fresh deploy is always seen,
 *     falling back to a cached copy, then to the precached /offline.html shell
 *     when the network is unavailable.
 *   - Hashed build assets (/_next/static/*): cache-first, they are immutable
 *     and content-addressed, so a cached hit is always correct.
 *   - Other same-origin GETs (icons, manifest, app.config.json): network-first
 *     with a cache fallback.
 *   - Cross-origin (Google Maps, OSM tiles, Nominatim): never intercepted, so
 *     the local-first privacy promise holds and remote API traffic is never
 *     stored.
 *
 * Bump CACHE_VERSION to evict old caches on deploy. */

const CACHE_VERSION = 'osint-arsenal-v3';
const PRECACHE_URLS = ['/offline.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      await cache.addAll(PRECACHE_URLS).catch(() => {});
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

async function networkFirst(request, cache) {
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request, cache) {
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

async function navigationHandler(request, cache) {
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const offline = await cache.match('/offline.html');
    if (offline) return offline;
    return new Response('You are offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  const isImmutableAsset = url.pathname.startsWith('/_next/static/');

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_VERSION);
      if (isNavigation) return navigationHandler(request, cache);
      return isImmutableAsset
        ? cacheFirst(request, cache)
        : networkFirst(request, cache);
    })(),
  );
});
