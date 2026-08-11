'use client';

import { useEffect } from 'react';

const LEGACY_FONT_CACHE_NAMES = new Set([
  'rarechar-fonts-v1',
  'rarechar-fonts-cache'
]);

export default function ServiceWorkerRegister() {
  useEffect(() => {
    const removeLegacyCaches = async () => {
      try {
        window.localStorage.removeItem('rarechar_font_cache');
      } catch (error) {
        console.warn('[SW] Failed to remove legacy font metadata:', error);
      }
      if (!('caches' in window)) return;

      const cacheNames = await window.caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => LEGACY_FONT_CACHE_NAMES.has(cacheName))
          .map((cacheName) => window.caches.delete(cacheName))
      );
    };

    const updateLegacyWorker = async () => {
      if (!('serviceWorker' in navigator)) return;

      try {
        const rootScope = new URL('/', window.location.href).href;
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(
          registrations
            .filter((registration) => registration.scope === rootScope)
            .map((registration) => registration.update())
        );
      } catch (error) {
        console.warn('[SW] Failed to update legacy service worker:', error);
      }
    };

    Promise.all([removeLegacyCaches(), updateLegacyWorker()]).catch((error) => {
      console.warn('[SW] Legacy cleanup failed:', error);
    });
  }, []);

  return null;
}
