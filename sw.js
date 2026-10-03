// Il mio mondo: funziona anche senza internet. Versione 7faf6b6583
const CACHE = 'mondo-7faf6b6583';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).pathname.includes('/licenze/')) return; // app separata (Licenze e presenze): non toccarla
  if (new URL(e.request.url).pathname.endsWith('version.json')) return; // sempre dalla rete
  // pagina: prima la rete (per gli aggiornamenti), se manca internet la copia salvata
  if (e.request.mode === 'navigate') { e.respondWith(fetch(e.request, { cache: 'no-store' }).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put('./index.html', cp)); return r; }).catch(() => caches.match('./index.html'))); return; }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; })));
});
