// Service Worker for FruitVerse Snake PWA
const CACHE_NAME = 'fruitverse-v1';

self.addEventListener('install', event => {
    // Skip caching on install to ensure it always fetches the latest files
    // The service worker exists just to make the app installable as a PWA
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
    // For now, act as a network-first fetcher without caching
    event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
