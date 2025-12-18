const CACHE_NAME = 'hugnet-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './menu.html',
  './dashboard.html',
  './intercambio.html',
  './css/styles.css', // Si tienes CSS externo
  './js/app.js',
  './manifest.json'
];

// 1. Instalación: Cacheamos los archivos estáticos básicos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos cacheados correctamente');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch: Interceptamos peticiones (Estrategia básica: Network First, fallback Cache)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});