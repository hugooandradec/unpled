const CACHE_NAME = "unpled-v2";

const ASSETS = [
  "./",
  "./index.html",

  // CSS corretos (os que seu index.html realmente usa)
  "./css/global.css",
  "./css/index.css",
  "./css/collection.css",

  // JS
  "./js/app.js",
  "./js/ui.js",
  "./js/gacha.js",
  "./js/storage.js",
  "./js/collection.js",

  // Dados
  "./data/cards.js",

  // PWA
  "./manifest.webmanifest",

  // Ícones (ajusta conforme seus arquivos reais)
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
