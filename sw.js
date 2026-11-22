const CACHE_NAME = 'zabegalovka-apk-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './menu.js',
  './daytime.js',
  './controls.js',
  './customers.js',
  './computer.js',
  './save.js',
  './kitchen.js',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
