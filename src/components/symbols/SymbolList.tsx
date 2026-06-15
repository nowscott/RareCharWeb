'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SYMBOL_PAGE_SIZE } from '@/lib/core/pagination';
import { PaginatedSymbolResponse, SymbolData } from '@/lib/core/types';
import SymbolCard from './SymbolCard';
import SymbolDetail from './SymbolDetail';

interface SymbolListProps {
  apiEndpoint: string;
  category: string;
  searchQuery: string;
  initialData: PaginatedSymbolResponse;
  initialSeed: number;
}

function buildRequestKey(apiEndpoint: string, category: string, searchQuery: string, retryCount: number) {
  return JSON.stringify([apiEndpoint, category, searchQuery, retryCount]);
}

const SymbolList: React.FC<SymbolListProps> = ({
  apiEndpoint,
  category,
  searchQuery,
  initialData,
  initialSeed
}) => {
  const initialRequestKey = buildRequestKey(apiEndpoint, 'all', '', 0);
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolData | null>(null);
  const [allSymbols, setAllSymbols] = useState<SymbolData[]>(initialData.symbols);
  const [currentPage, setCurrentPage] = useState(initialData.page);
  const [hasMore, setHasMore] = useState(initialData.hasMore);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(initialRequestKey);
  const [failedRequestKey, setFailedRequestKey] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const hasRequestedDynamicDataRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const seedRef = useRef(initialSeed);

  const requestKey = buildRequestKey(apiEndpoint, category, searchQuery, retryCount);
  const isInitialRequest = category === 'all' && searchQuery === '' && retryCount === 0;
  const loading = loadedRequestKey !== requestKey && failedRequestKey !== requestKey;
  const error = failedRequestKey === requestKey ? '加载失败，请重试' : null;

  // 构建 API URL
  const buildUrl = useCallback((page: number) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(SYMBOL_PAGE_SIZE));
    params.set('seed', String(seedRef.current));
    if (category && category !== 'all') params.set('category', category);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    return `${apiEndpoint}?${params.toString()}`;
  }, [apiEndpoint, category, searchQuery]);

  // category/search 变化时重置
  useEffect(() => {
    if (isInitialRequest && !hasRequestedDynamicDataRef.current) {
      return;
    }

    if (loadedRequestKey === requestKey) return;

    hasRequestedDynamicDataRef.current = true;
    seedRef.current = Date.now();

    const controller = new AbortController();
    fetch(buildUrl(1), { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PaginatedSymbolResponse) => {
        setAllSymbols(data.symbols);
        setCurrentPage(1);
        setHasMore(data.hasMore);
        setFailedRequestKey(null);
        setLoadedRequestKey(requestKey);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setFailedRequestKey(requestKey);
        }
      });

    return () => controller.abort();
  }, [buildUrl, isInitialRequest, loadedRequestKey, requestKey]);

  // 加载下一页
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPage = currentPage + 1;
    fetch(buildUrl(nextPage))
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PaginatedSymbolResponse) => {
        setAllSymbols(prev => [...prev, ...data.symbols]);
        setCurrentPage(nextPage);
        setHasMore(data.hasMore);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [currentPage, hasMore, loadingMore, buildUrl]);

  // IntersectionObserver 滚动加载
  useEffect(() => {
    if (loading || loadingMore || !hasMore) return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadMore();
        }
      },
      { rootMargin: '800px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore, loadMore]);

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => setRetryCount(count => count + 1)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (allSymbols.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {searchQuery ? '没有找到匹配的符号' : '没有符号可显示'}
        </p>
      </div>
    );
  }

  return (
    <>
      {loading && (
        <div
          role="status"
          className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-gray-900/90 px-3 py-1.5 text-xs text-white shadow-lg backdrop-blur dark:bg-white/90 dark:text-gray-900"
        >
          正在更新结果...
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
        {allSymbols.map((symbol, index) => (
          <SymbolCard
            key={`${symbol.symbol}-${index}`}
            symbol={symbol}
            onClick={() => setSelectedSymbol(symbol)}
          />
        ))}
      </div>

      {hasMore && (
        <div ref={sentinelRef} className="py-4 flex justify-center">
          {loadingMore ? (
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="h-10" />
          )}
        </div>
      )}

      {selectedSymbol && (
        <SymbolDetail
          symbol={selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
        />
      )}
    </>
  );
};

export default SymbolList;
