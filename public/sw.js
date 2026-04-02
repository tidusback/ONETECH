// ─── Trivelox PWA Service Worker ────────────────────────────────────────────
//
// Caching strategy:
//   /_next/static/  → cache-first  (content-hashed filenames, never stale)
//   Google Fonts    → cache-first  (long-lived CDN URLs)
//   Navigation      → network-first, fallback to /offline
//   Other assets    → cache-first  with network fallback
//
// Bump CACHE_VERSION on every production deploy to evict stale shell cache.
// Static assets self-invalidate via content hashes — no version bump needed.

const CACHE_VERSION  = 'v2'
const SHELL_CACHE    = `trivelox-shell-${CACHE_VERSION}`
const STATIC_CACHE   = `trivelox-static-${CACHE_VERSION}`

// Pages pre-cached on install — must be publicly accessible (no auth required)
const PRECACHE_URLS = ['/offline', '/login']

// ─── Install ─────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

// ─── Activate ────────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
  const alive = [SHELL_CACHE, STATIC_CACHE]
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !alive.includes(k)).map((k) => caches.delete(k))),
      )
      .then(() => self.clients.claim()),
  )
})

// ─── Message ─────────────────────────────────────────────────────────────────
// Allow the page to trigger skipWaiting programmatically in future if needed.

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

// ─── Fetch ────────────────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only intercept GET requests
  if (request.method !== 'GET') return

  const isSameOrigin   = url.origin === self.location.origin
  const isGoogleFont   =
    url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'

  // Drop cross-origin requests except Google Fonts
  if (!isSameOrigin && !isGoogleFont) return

  // ── Google Fonts — cache-first ──────────────────────────────────────────
  if (isGoogleFont) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // ── Next.js static chunks — cache-first (content-hashed, immutable) ────
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  // ── Skip: image optimizer, API routes, Supabase auth callbacks ──────────
  if (
    url.pathname.startsWith('/_next/image') ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/')
  ) {
    return
  }

  // ── Skip remaining Next.js internals ────────────────────────────────────
  if (url.pathname.startsWith('/_next/')) return

  // ── HTML navigation — network-first, offline fallback ───────────────────
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNav(request))
    return
  }

  // ── All other same-origin assets (icons, fonts, static files) ───────────
  event.respondWith(cacheFirst(request, SHELL_CACHE))
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Cache-first: serve from cache; on miss fetch, store, and return. */
async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (response.ok) cache.put(request, response.clone())
  return response
}

/**
 * Network-first for navigations.
 * On network failure: try cached page → cached /offline → bare offline Response.
 */
async function networkFirstNav(request) {
  const cache = await caches.open(SHELL_CACHE)
  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached

    const offline = await cache.match('/offline')
    if (offline) return offline

    // Last resort — bare HTML so the browser doesn't show a blank error
    return new Response(
      '<!doctype html><html><head><meta charset="utf-8"><title>Offline</title></head>' +
      '<body style="font-family:sans-serif;padding:2rem"><h1>You are offline</h1>' +
      '<p>Check your connection and try again.</p></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html' } },
    )
  }
}
