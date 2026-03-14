const CACHE_NAME = 'chess-cache-v1';
const urlsToCache = [
  '/', // main route
  '/static/style.css',
  '/static/js/board.js',
  '/static/js/games.js',
  '/static/js/moves.js',
  '/static/js/rules.js',
  '/static/js/utils.js',
  '/static/icon.png'
];

// Install service worker and cache files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate service worker and clean old caches if any
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
});

// Intercept requests and serve cached files when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // Return cached version if available, else fetch from network
      return response || fetch(event.request);
    }).catch(() => {
      // Optional: fallback if file not cached
      if (event.request.mode === 'navigate') {
        return caches.match('/'); // serve index.html for navigation requests
      }
    })
  );
});