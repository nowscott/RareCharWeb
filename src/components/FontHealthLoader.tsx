'use client';

import { ComponentType, useEffect, useState } from 'react';

export default function FontHealthLoader() {
  const [Checker, setChecker] = useState<ComponentType | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    try {
      if (window.localStorage.getItem('rarechar_font_debug') !== '1') return;
    } catch (error) {
      console.warn('[Font] Debug flag is unavailable:', error);
      return;
    }

    let cancelled = false;
    import('./FontHealthChecker').then((module) => {
      if (!cancelled) setChecker(() => module.default);
    }).catch((error) => {
      console.warn('[Font] Failed to load diagnostics:', error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return Checker ? <Checker /> : null;
}
