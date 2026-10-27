/* Ludo_Consulting — service worker minimal.
 * Rôle : rendre l'application installable (PWA) et accélérer les ressources
 * statiques versionnées. Les pages et appels API passent toujours par le réseau :
 * aucun contenu dynamique n'est mis en cache, donc aucun risque de page périmée.
 */
const VERSION = "ludo-v1";
const STATIC_CACHE = `${VERSION}-static`;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== STATIC_CACHE).map((key) => caches.delete(key))),
    ).then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  // Cache-first uniquement pour les fichiers statiques Next.js (URLs hachées, immuables).
  if (!url.pathname.startsWith("/_next/static/")) return;
  event.respondWith(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
      }),
    ),
  );
});
