'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CategoryStat, PaginatedSymbolResponse } from '@/lib/core/types';
import { SearchBar, CategoryNav } from '@/components/navigation';
import { SymbolList } from '@/components/symbols';
import { optimizeSymbolRendering, waitForFontsLoad } from '@/lib/font/fontUtils';

interface HomeClientProps {
  apiEndpoint: string;
  categories: CategoryStat[];
  initialData: PaginatedSymbolResponse;
  initialSeed: number;
  pageTitle?: string;
  pageDescription?: string;
}

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
  const [prefetchRequest, setPrefetchRequest] = useState<{ category: string; nonce: number } | null>(null);

  useEffect(() => {
    optimizeSymbolRendering();
    waitForFontsLoad().catch((error) => {
      console.warn('Font loading failed:', error);
    });
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setActiveCategory(category);
    setSearchQuery('');
  }, []);

  const handleCategoryPrefetch = useCallback((category: string) => {
    setPrefetchRequest({ category, nonce: Date.now() });
  }, []);

  const initialPrefetchCategories = useMemo(
    () => categories
      .filter((category) => category.id !== 'all')
      .slice(0, 6)
      .map((category) => category.id),
    [categories]
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 顶部导航栏 */}
        <nav className="mb-6 sm:mb-8">
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">{pageTitle}</h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{pageDescription}</p>
            </div>
            <div className="flex space-x-2 sm:space-x-4">
              <Link 
                href="/home"
                className={`px-3 py-2 sm:px-4 sm:py-2 ${pageTitle === "复制符" ? 'bg-blue-600' : 'bg-gray-400 hover:bg-gray-500'} text-white rounded-lg transition-colors flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base touch-manipulation active:scale-95`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span className="hidden sm:inline sm:ml-2">符号</span>
              </Link>
              <Link 
                href="/emoji"
                className={`px-3 py-2 sm:px-4 sm:py-2 ${pageTitle === "Emoji" ? 'bg-orange-600' : 'bg-gray-400 hover:bg-gray-500'} text-white rounded-lg transition-colors flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base touch-manipulation active:scale-95`}
              >
                <span className="text-lg">😀</span>
                <span className="hidden sm:inline sm:ml-2">Emoji</span>
              </Link>
              <Link 
                href="/about"
                className={`px-3 py-2 sm:px-4 sm:py-2 ${pageTitle === "关于" ? 'bg-purple-600' : 'bg-gray-400 hover:bg-gray-500'} text-white rounded-lg transition-colors flex items-center justify-center sm:justify-start sm:space-x-2 text-sm sm:text-base touch-manipulation active:scale-95`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="hidden sm:inline sm:ml-2">关于</span>
              </Link>
            </div>
          </div>
        </nav>

        <div className="mb-6">
          <SearchBar value={searchQuery} onSearch={setSearchQuery} />
        </div>

        <div className="mb-6">
          <CategoryNav 
            activeCategory={activeCategory} 
            onSelectCategory={handleCategoryChange} 
            onPrefetchCategory={handleCategoryPrefetch}
            categories={categories} 
          />
        </div>

        <SymbolList 
          apiEndpoint={apiEndpoint}
          category={activeCategory}
          searchQuery={searchQuery}
          initialData={initialData}
          initialSeed={initialSeed}
          prefetchCategories={initialPrefetchCategories}
          prefetchRequest={prefetchRequest}
        />
      </div>
    </div>
  );
}
