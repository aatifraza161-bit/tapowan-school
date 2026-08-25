const CACHE_NAME = 'educore-tps-v1787673189304';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-First: Always fetch latest app.js and HTML
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/') || event.request.url.includes('app.js') || event.request.url.includes('.html')) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
