const CACHE_NAME = 'emergency-app-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/i18n/en/en.json',
    '/i18n/si/si.json',
    // add other files that need to be cached
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request);
            })
    );
});
