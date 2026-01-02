const CACHE_NAME = "card-gacha-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./css/style.css",
  "./js/app.js",
  "./js/storage.js",
  "./data/cards.js",
  "./manifest.webmanifest"
  // quando você criar ícones, coloca aqui também
  // "./assets/icons/icon-192.png",
  // "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async ()=>{
      const keys = await caches.keys();
      await Promise.all(keys.map(k => (k !== CACHE_NAME) ? caches.delete(k) : null));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async ()=>{
      const cached = await caches.match(event.request);
      if(cached) return cached;
      try{
        const res = await fetch(event.request);
        return res;
      }catch{
        // fallback simples: index
        return caches.match("./index.html");
      }
    })()
  );
});
