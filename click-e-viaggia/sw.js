'use strict';
const CACHE = 'click-viaggia-v18';
const ASSETS = [
  './blog.html', './journal.css?v=1', './journal.js?v=1',
  "./blog.css?v=2", "./article.js?v=1", "./blog-fatima-nazare.html", "./blog-nosy-be.html", "./blog-marsa-alam.html", "./assets/blog-nazare.jpg", "./assets/blog-nosy-iranja.jpg", "./assets/blog-nosy-sakatia.jpg", "./assets/blog-lokobe.jpg", "./assets/blog-sharm-el-luli.jpg", "./assets/blog-port-ghalib.jpg", "./assets/blog-marsa-desert.jpg", "./assets/blog-camels-red-sea.jpg",
  './trip-layout.css?v=1', './trips.css?v=1', './viaggio-fatima.html', './viaggio-disney.html',
  './assets/grafica-fatima.svg', './assets/grafica-fatima.png',
  './assets/grafica-disney-v2.svg', './assets/grafica-disney-v2.png',
  './assets/fatima.jpg', './assets/disney-panorama.jpg', './assets/fatima-basilica.jpg', './assets/fatima-chapel.jpg',
  './data/country-editorial.json', './data/country-photos.json', './map-navigation.js?v=9',
  './i-miei-viaggi.html', './map.js?v=11', './map-auth.js', './map.css?v=10', './data/map.json', './assets/flags.svg',
  './', './index.html', './style.css', './style.css?v=11', './app.js?v=17', './legal.html', './chi-siamo.html',
  './team.js?v=15', './data/team.json', './data/contact.json', './trip.js', './data/travel-links.json',
  './icon.svg', './manifest.webmanifest', './manifest.webmanifest?v=17', './assets/ocean.jpg',
  './presentation.css?v=2', './brand.css?v=2', './assets/brand-logo-v3.svg', './assets/brand-mark-v3.svg',
  './assets/app-icon-v3.svg', './assets/app-icon-192-v3.png', './assets/app-icon-512-v3.png',
  './assets/app-icon-maskable-512-v3.png', './assets/apple-touch-icon-v3.png', './assets/favicon-32-v3.png',
  './assets/brand-social-v3.png', './assets/icon-192.png', './assets/icon-512.png'
];
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
