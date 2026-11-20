// Network-first navigation: new builds appear on the next online launch.
const CACHE = 'vicarius-regis-pwa-v1';
const HOME = new URL('./index.html', self.location.href).href;
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(['./index.html','./manifest.json','./icon-192.png','./icon-512.png'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      try {
        const response = await fetch(request, {cache:'no-store'});
        if (!response.ok) throw new Error('Navigation failed');
        await cache.put(HOME, response.clone());
        return response;
      } catch (error) { return (await cache.match(HOME)) || Response.error(); }
    })());
  } else {
    event.respondWith(fetch(request).catch(async () => (await caches.match(request)) || Response.error()));
  }
});
