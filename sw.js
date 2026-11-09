// Offline-Speicher für die Reise-App.
// Bei Änderungen an der App die Versionsnummer erhöhen.
var CACHE = "indien-reise-v10";
var DATEIEN = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); }));
  self.skipWaiting();
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

// Zuerst aus dem Speicher antworten (sofort, auch ohne Internet),
// im Hintergrund nach einer neueren Version schauen.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then(function (c) {
      return c.match(e.request, { ignoreSearch: true }).then(function (gespeichert) {
        var netz = fetch(e.request).then(function (antwort) {
          if (antwort && antwort.ok) c.put(e.request, antwort.clone());
          return antwort;
        }).catch(function () { return gespeichert; });
        return gespeichert || netz;
      });
    })
  );
});
