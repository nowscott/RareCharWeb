'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CategoryStat, PaginatedSymbolResponse } from '@/lib/core/types';
import { SearchBar, CategoryNav } from '@/components/navigation';
import { SymbolList } from '@/components/symbols';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { optimizeSymbolRendering } from '@/lib/font/fontUtils';

interface HomeClientProps {
  apiEndpoint: string;
  categories: CategoryStat[];
  initialData: PaginatedSymbolResponse;
  initialSeed: number;
  pageTitle?: string;
  pageDescription?: string;
}

const HOME_CLIENT_VERSION = '1.13.0-liquid-glass';

export default function HomeClient({
  apiEndpoint,
  categories,
  initialData,
  initialSeed,
  pageTitle = "复制符",
  pageDescription = "快速查找特殊符号，一键复制"
}: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [isSearchComposing, setIsSearchComposing] = useState(false);

  useEffect(() => {
    optimizeSymbolRendering();
  }, []);

  useEffect(() => {
    if (isSearchComposing) return;
    if (!searchQuery) return;

    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [isSearchComposing, searchQuery]);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query) setDebouncedSearchQuery('');
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
    setDebouncedSearchQuery('');
  }, []);

  return (
    <div className="liquid-page py-4 sm:py-8 px-4" data-client-version={HOME_CLIENT_VERSION}>
      <div className="liquid-shell max-w-6xl mx-auto">
        {/* 顶部导航栏 */}
        <nav className="mb-6 sm:mb-8">
          <div className="liquid-header">
            <LiquidGlassSurface variant="panel" className="p-4 sm:p-5">
              <div className="flex flex-row justify-between items-start gap-4 sm:items-center">
                <div className="flex min-w-0 flex-col">
                  <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-gray-950 dark:text-white">{pageTitle}</h1>
                  <p className="text-sm sm:text-base liquid-text-muted">{pageDescription}</p>
                </div>
                <div className="-mt-1 flex shrink-0 flex-wrap justify-end gap-2 sm:mt-0 sm:gap-3">
                  <LiquidGlassSurface variant="pill" active={pageTitle === "复制符"} tone="symbol">
                    <Link
                      href="/home"
                      className={`liquid-nav-button liquid-focus px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base touch-manipulation active:scale-95 ${pageTitle === "复制符" ? 'text-white' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <span className="hidden sm:inline sm:ml-2">符号</span>
                    </Link>
                  </LiquidGlassSurface>
                  <LiquidGlassSurface variant="pill" active={pageTitle === "Emoji"} tone="emoji">
                    <Link
                      href="/emoji"
                      className={`liquid-nav-button liquid-focus px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base touch-manipulation active:scale-95 ${pageTitle === "Emoji" ? 'text-white' : ''}`}
                    >
                      <span className="text-lg">😀</span>
                      <span className="hidden sm:inline sm:ml-2">Emoji</span>
                    </Link>
                  </LiquidGlassSurface>
                  <LiquidGlassSurface variant="pill" active={pageTitle === "关于"} tone="about">
                    <Link
                      href="/about"
                      className={`liquid-nav-button liquid-focus px-3 py-2 sm:px-4 sm:py-2 flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base touch-manipulation active:scale-95 ${pageTitle === "关于" ? 'text-white' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="hidden sm:inline sm:ml-2">关于</span>
                    </Link>
                  </LiquidGlassSurface>
                </div>
              </div>
            </LiquidGlassSurface>
            </div>
        </nav>

        <div className="mb-6">
          <SearchBar
            value={searchQuery}
            onSearch={handleSearchChange}
            onCompositionChange={setIsSearchComposing}
          />
        </div>

        <div className="mb-6">
          <CategoryNav
            activeCategory={activeCategory}
            onSelectCategory={handleCategoryChange}
            categories={categories}
          />
        </div>

        <SymbolList
          key={apiEndpoint}
          apiEndpoint={apiEndpoint}
          category={activeCategory}
          searchQuery={debouncedSearchQuery}
          initialData={initialData}
          initialSeed={initialSeed}
        />
      </div>
    </div>
  );
}
