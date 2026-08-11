self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith('rarechar-fonts-'))
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});
