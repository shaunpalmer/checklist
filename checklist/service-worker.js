const CACHE_VERSION = 'checklist-shell-v19';
const SHELL_ASSETS = [
  './',
  './manifest.json',
  './css/checklist-variables.css',
  './css/checklist-style.css',
  './js/checklist-script.js',
  './js/event-worker.js',
  './js/data/ITEM_DEFINITIONS.js',
  './js/data/checklist-config.js',
  './js/patterns/AysPropertyType.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(SHELL_ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Never cache auth-related PHP files — they must always hit the server
  const path = url.pathname;
  if (path.endsWith('.php') || path.includes('/auth/') || path.includes('/config/') || path.includes('/storage/')) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});
