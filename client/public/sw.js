// Service Worker for GroceShop PWA
const CACHE_VERSION = 'v1';
const STATIC_CACHE = `groceshop-static-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Assets to pre-cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      }),
      self.skipWaiting(),
    ])
  );
});

self.addEventListener("activate", (event) => {
  // Clean old caches
  event.waitUntil(
    Promise.all([
      clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('groceshop-') && name !== STATIC_CACHE)
            .map((name) => caches.delete(name))
        );
      }),
    ])
  );
});

// Network-first strategy for navigation requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip socket.io and WebSocket connections
  if (url.pathname.includes('/socket.io/') || url.pathname.includes('ws://') || url.pathname.includes('wss://')) {
    return;
  }

  // API requests: NetworkFirst with timeout
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirstWithTimeout(request, 5000));
    return;
  }

  // Images: CacheFirst
  if (request.destination === 'image' || url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif)$/i)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Fonts: CacheFirst
  if (url.pathname.match(/\.(woff2?|ttf|otf|eot)$/i)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation: NetworkFirst with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithTimeout(request, 3000).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }

  // Static assets: StaleWhileRevalidate
  event.respondWith(staleWhileRevalidate(request));
});

async function networkFirstWithTimeout(request, timeout) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Network timeout')), timeout)
  );

  try {
    const response = await Promise.race([
      fetch(request),
      timeoutPromise,
    ]);
    
    if (response && response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
      return response;
    }
    throw new Error('Response not ok');
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return new Response('', { status: 408, statusText: 'Offline' });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}