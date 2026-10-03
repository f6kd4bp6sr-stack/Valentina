// Licenze e presenze: funziona anche senza internet. Versione 4f6df4fffc
const CACHE = 'licenze-4f6df4fffc';
const FILES = ['./', './index.html', './taichi.html', './progressi.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('licenze-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).pathname.endsWith('version.json')) return; // sempre dalla rete
  if (e.request.mode === 'navigate') { const pn = new URL(e.request.url).pathname, page = pn.endsWith('taichi.html') ? './taichi.html' : pn.endsWith('progressi.html') ? './progressi.html' : './index.html'; e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => { const cp = r.clone(); if (r.ok) caches.open(CACHE).then(c => { c.put(page, cp); c.match('./progressi.html').then(h => h || c.addAll(FILES).catch(() => {})); }); return r.ok ? r : caches.match(page).then(h => h || r); }).catch(() => caches.match(page))); return; }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; })));
});
