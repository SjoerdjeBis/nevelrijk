// Nevelrijk — offline cache (netwerk eerst, cache als terugval)
const C = 'nevelrijk-v1';
const FILES = ['./', 'index.html', 'css/style.css', 'js/audio.js', 'js/art.js', 'js/engine.js', 'js/puzzles.js', 'js/scenes.js', 'js/ui.js', 'icon.svg', 'manifest.webmanifest'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(C).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(C).then((c) => c.put(e.request, copy)).catch(() => {}); return r; }).catch(() => caches.match(e.request)));
});
