const CACHE_NAME = 'CR3T-Stock-Take-v1.1';
const urlsToCache = [
  '/CR3T-Stock-Take/',
  '/CR3T-Stock-Take/index.html',
  '/CR3T-Stock-Take/app.js',
  '/CR3T-Stock-Take/manifest.json',
  '/CR3T-Stock-Take/icons/CR3T icon-192x192.png',
  '/CR3T-Stock-Take/icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).catch(function() {
      return caches.match(event.request);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
