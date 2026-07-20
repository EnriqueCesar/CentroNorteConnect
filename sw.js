const VERSION = "centro-norte-connect-v3";
const CORE = [
  "./", "./index.html", "./regional-review.html", "./competidores_cn.html",
  "./Plan_Accion_Centro_Norte.html", "./offline.html", "./app.css", "./app.js",
  "./campaign.json", "./manifest.json", "./icono-centro-norte.png", "./img/icono-centro-norte.png"
];
self.addEventListener("install", event => event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(CORE))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== VERSION).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener("message", event => { if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => { const copy = response.clone(); caches.open(VERSION).then(cache => cache.put(event.request, copy)); return response; }).catch(() => caches.match(event.request).then(hit => hit || caches.match("./offline.html"))));
    return;
  }
  event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => { if (response.ok) caches.open(VERSION).then(cache => cache.put(event.request, response.clone())); return response; })));
});
