const CACHE_NAME = 'store-manager-v2';
const urlsToCache = [
  './index.html',
  './style.css',
  './app.js'
];

// Install: cache core files
self.addEventListener('install', event => {
  self.skipWaiting(); // Activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate: delete old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: network-first strategy — always try fresh, fall back to cache
self.addEventListener('fetch', event => {
  // Fix: Only handle http/https requests to avoid 'chrome-extension' scheme errors
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone and cache the fresh response
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Network failed — serve from cache (offline support)
        return caches.match(event.request);
      })
  );
});
