// Licenze e presenze: funziona anche senza internet. Versione 38006b1b4b
const CACHE = 'licenze-38006b1b4b';
const FILES = ['./', './index.html', './taichi.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('licenze-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (e.request.url.endsWith('version.json')) return; // sempre dalla rete
  if (e.request.mode === 'navigate') { const page = new URL(e.request.url).pathname.endsWith('taichi.html') ? './taichi.html' : './index.html'; e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => { const cp = r.clone(); if (r.ok) caches.open(CACHE).then(c => c.put(page, cp)); return r; }).catch(() => caches.match(page))); return; }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; })));
});
