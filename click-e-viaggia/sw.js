'use strict';
const CACHE = 'click-viaggia-v12';
const ASSETS = ['./trip-layout.css?v=1', './viaggio-fatima.html', './viaggio-disney.html', './assets/grafica-fatima.svg', './assets/grafica-disney.svg', './assets/grafica-fatima.png', './assets/grafica-disney.png', './assets/fatima.jpg', './assets/disney-illustration.svg', './data/country-editorial.json', './data/country-photos.json', './map-navigation.js?v=9', './i-miei-viaggi.html', './map.js?v=10', './map-auth.js', './map.css?v=10', './data/map.json', './assets/flags.svg', './', './index.html', './style.css', './style.css?v=11', './app.js?v=11', './legal.html', './chi-siamo.html', './team.js', './data/team.json', './data/contact.json', './trip.js', './viaggio-portogallo.html', './viaggio-islanda.html', './viaggio-marocco.html', './assets/portogallo.jpg', './assets/islanda.jpg', './assets/marocco.jpg', './data/travel-links.json', './icon.svg', './manifest.webmanifest', './assets/ocean.jpg', './assets/icon-192.png', './assets/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('click-viaggia-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (new URL(event.request.url).pathname.endsWith('/data/auth-config.json')) return;
  if (new URL(event.request.url).pathname.endsWith('/admin.html') || new URL(event.request.url).pathname.endsWith('/admin.js')) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (event.request.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
    return Response.error();
  }));
});

