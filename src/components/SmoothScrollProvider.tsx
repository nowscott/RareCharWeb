'use client';

import { ReactLenis, useLenis } from 'lenis/react';
import { ReactNode, useEffect, useRef } from 'react';

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        autoRaf: true,
        lerp: 0.1,
        wheelMultiplier: 0.72,
        touchMultiplier: 1,
        syncTouch: false
      }}
    >
      <ScrollRenderingGuard />
      {children}
    </ReactLenis>
  );
}

function ScrollRenderingGuard() {
  const removeClassTimerRef = useRef<number | null>(null);

  useLenis((lenis) => {
    if (!lenis.isScrolling) return;

    document.documentElement.classList.add('is-lenis-scrolling');

    if (removeClassTimerRef.current) {
      window.clearTimeout(removeClassTimerRef.current);
    }

    removeClassTimerRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove('is-lenis-scrolling');
      removeClassTimerRef.current = null;
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      if (removeClassTimerRef.current) {
        window.clearTimeout(removeClassTimerRef.current);
      }
      document.documentElement.classList.remove('is-lenis-scrolling');
    };
  }, []);

  return null;
}
