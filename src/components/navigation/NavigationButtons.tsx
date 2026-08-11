'use client';

import Link from 'next/link';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';

export default function NavigationButtons() {
  return (
    <>
      <LiquidGlassSurface variant="pill">
        <Link
          href="/home"
          prefetch={false}
          className="liquid-nav-button liquid-focus px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span className="hidden sm:inline sm:ml-2">符号</span>
        </Link>
      </LiquidGlassSurface>
      <LiquidGlassSurface variant="pill">
        <Link
          href="/emoji"
          prefetch={false}
          className="liquid-nav-button liquid-focus px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base touch-manipulation active:scale-95"
        >
          <span className="text-lg">😀</span>
          <span className="hidden sm:inline sm:ml-2">Emoji</span>
        </Link>
      </LiquidGlassSurface>
      <LiquidGlassSurface variant="pill" active tone="about">
        <Link
          href="/about"
          prefetch={false}
          className="liquid-nav-button liquid-focus px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base text-white touch-manipulation active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="hidden sm:inline sm:ml-2">关于</span>
        </Link>
      </LiquidGlassSurface>
    </>
  );
}
