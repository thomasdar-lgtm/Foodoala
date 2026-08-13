const CACHE_VERSION = 'foodoala-v2.02';
const ASSETS = ['./', './index.html', './manifest.json',
  './icons/icon-32.png', './icons/icon-180.png', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_VERSION).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (url.includes('googleapis.com/drive') || url.includes('googleapis.com/upload') || url.includes('accounts.google.com')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok && e.request.method === 'GET') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
