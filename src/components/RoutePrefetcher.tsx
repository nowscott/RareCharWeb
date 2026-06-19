'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ROUTES_TO_PREFETCH = ['/home', '/emoji', '/about'];

export default function RoutePrefetcher() {
  const router = useRouter();

  useEffect(() => {
    const prefetchRoutes = () => {
      ROUTES_TO_PREFETCH.forEach((route) => {
        router.prefetch(route);
      });
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetchRoutes, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(prefetchRoutes, 500);
    return () => clearTimeout(id);
  }, [router]);

  return null;
}
