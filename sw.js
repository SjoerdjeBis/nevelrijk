// Nevelrijk — offline-opslag
// - De game zelf (html, css, js): netwerk eerst, zodat je altijd de nieuwste versie krijgt.
//   Zonder internet valt hij terug op de bewaarde versie.
// - Stemopnames: de bestandsnaam bevat een hash van de tekst, dus een opname verandert nooit.
//   Die bewaren we één keer en halen we daarna direct uit de opslag.
// - Andere sites (zoals lettertypen) en gedeeltelijke downloads bewaren we niet.
// Bij een nieuwe versie worden oude opslagen opgeruimd.
const APP = 'nevelrijk-app-v3';
const VOICE = 'nevelrijk-stemmen-v1';
const KEEP = [APP, VOICE];
const FILES = ['./', 'index.html', 'css/style.css', 'js/voicekey.js', 'audio/voice/manifest.js', 'js/audio.js', 'js/art.js', 'js/engine.js', 'js/puzzles.js', 'js/scenes.js', 'js/ui.js', 'icon.svg', 'manifest.webmanifest'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(APP).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((names) => Promise.all(names.filter((n) => !KEEP.includes(n)).map((n) => caches.delete(n))))
    .then(() => self.clients.claim()));
});

const sameOrigin = (url) => url.origin === self.location.origin;
const storable = (r) => r && r.status === 200 && r.type === 'basic';

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (!sameOrigin(url)) return; // lettertypen e.d. laat de browser zelf bewaren

  if (/\/audio\/voice\/[\w-]+\.mp3$/.test(url.pathname)) {
    // opname: eerst uit de opslag, anders ophalen en bewaren
    e.respondWith(caches.open(VOICE).then((c) => c.match(req).then((hit) => hit || fetch(req).then((r) => {
      if (storable(r)) c.put(req, r.clone()).catch(() => {});
      return r;
    }))));
    return;
  }
  // game-bestanden: netwerk eerst (zonder query, zodat ?v=… geen kopieën maakt)
  const key = url.origin + url.pathname;
  e.respondWith(fetch(req).then((r) => {
    if (storable(r)) { const copy = r.clone(); caches.open(APP).then((c) => c.put(key, copy)).catch(() => {}); }
    return r;
  }).catch(() => caches.match(key).then((hit) => hit || caches.match('index.html'))));
});
