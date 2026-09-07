/* Reformei — service worker
   Objetivo: deixar o app abrir offline sem NUNCA servir preço velho sem tentar a rede. */
var CACHE = "reformei-v2";
var SHELL = [
  "/",
  "/index.html",
  "/app.html",
  "/manifest.webmanifest",
  "/logo.png",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(SHELL);
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);

  // preços: rede primeiro, cache só como salva-vidas offline
  if (url.origin === location.origin && url.pathname.replace(/\/+$/, "").endsWith("/precos.json")) {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return caches.match(req); })
    );
    return;
  }

  // navegação (abrir uma página): rede primeiro, se cair usa o cache
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () {
        return caches.match(req).then(function (r) {
          return r || caches.match("/app.html") || caches.match("/");
        });
      })
    );
    return;
  }

  // resto (mesmo domínio + Google Fonts): usa cache e atualiza por trás
  var sameOrigin = url.origin === location.origin;
  var isFont = url.host.indexOf("gstatic") !== -1 || url.host.indexOf("googleapis") !== -1;
  if (!sameOrigin && !isFont) return;

  e.respondWith(
    caches.match(req).then(function (cached) {
      var network = fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () { return cached; });
      return cached || network;
    })
  );
});
