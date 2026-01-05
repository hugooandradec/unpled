const CACHE_NAME = "unpled-v2"; // sobe a versão pra forçar update

const ASSETS = [
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/app.js",
  "./js/ui.js",
  "./js/gacha.js",
  "./js/storage.js",
  "./manifest.webmanifest",

  // só deixa aqui se EXISTIR no repo:
  // "./data/cards.js",
  // "./assets/icons/icon-192.png",
  // "./assets/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      // adiciona um por um (se falhar, não quebra tudo)
      await Promise.allSettled(
        ASSETS.map((url) => cache.add(url))
      );

      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k))));
      self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const res = await fetch(event.request);
        // opcional: cacheia GETs bem-sucedidos
        if (event.request.method === "GET" && res.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, res.clone());
        }
        return res;
      } catch (e) {
        return cached || Response.error();
      }
    })()
  );
});
