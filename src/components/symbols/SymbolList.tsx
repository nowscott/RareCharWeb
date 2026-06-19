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
  prefetchCategories?: string[];
  prefetchRequest?: {
    category: string;
    nonce: number;
  } | null;
}

function normalizeSearchQuery(searchQuery: string) {
  return searchQuery.trim();
}

function buildRequestKey(apiEndpoint: string, category: string, searchQuery: string) {
  return JSON.stringify([apiEndpoint, category || 'all', normalizeSearchQuery(searchQuery)]);
}

function buildPageKey(requestKey: string, page: number) {
  return `${requestKey}:${page}`;
}

const SymbolList: React.FC<SymbolListProps> = ({
  apiEndpoint,
  category,
  searchQuery,
  initialData,
  initialSeed,
  prefetchCategories = [],
  prefetchRequest
}) => {
  const initialRequestKey = buildRequestKey(apiEndpoint, 'all', '');
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
  const pageCacheRef = useRef<Map<string, PaginatedSymbolResponse>>(
    new Map([[buildPageKey(initialRequestKey, initialData.page), initialData]])
  );
  const inflightRequestsRef = useRef<Map<string, Promise<PaginatedSymbolResponse>>>(new Map());
  const activeRequestSeqRef = useRef(0);
  const currentRequestKeyRef = useRef(initialRequestKey);

  const requestKey = buildRequestKey(apiEndpoint, category, searchQuery);
  const isInitialRequest = category === 'all' && normalizeSearchQuery(searchQuery) === '';
  const loading = loadedRequestKey !== requestKey && failedRequestKey !== requestKey;
  const error = failedRequestKey === requestKey ? '加载失败，请重试' : null;

  useEffect(() => {
    currentRequestKeyRef.current = requestKey;
  }, [requestKey]);

  // 构建 API URL
  const buildUrl = useCallback((page: number, targetCategory: string, targetSearchQuery: string) => {
    const normalizedSearch = normalizeSearchQuery(targetSearchQuery);
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(SYMBOL_PAGE_SIZE));
    if ((!targetCategory || targetCategory === 'all') && !normalizedSearch) {
      params.set('seed', String(seedRef.current));
    }
    if (targetCategory && targetCategory !== 'all') params.set('category', targetCategory);
    if (normalizedSearch) params.set('search', normalizedSearch);
    return `${apiEndpoint}?${params.toString()}`;
  }, [apiEndpoint]);

  const fetchPage = useCallback((
    targetCategory: string,
    targetSearchQuery: string,
    page: number,
    signal?: AbortSignal
  ) => {
    const targetRequestKey = buildRequestKey(apiEndpoint, targetCategory, targetSearchQuery);
    const pageKey = buildPageKey(targetRequestKey, page);
    const cached = pageCacheRef.current.get(pageKey);
    if (cached) {
      return Promise.resolve(cached);
    }

    const inflight = inflightRequestsRef.current.get(pageKey);
    if (inflight) {
      return inflight;
    }

    const promise = fetch(buildUrl(page, targetCategory, targetSearchQuery), { signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PaginatedSymbolResponse) => {
        pageCacheRef.current.set(pageKey, data);
        return data;
      })
      .finally(() => {
        inflightRequestsRef.current.delete(pageKey);
      });

    inflightRequestsRef.current.set(pageKey, promise);
    return promise;
  }, [apiEndpoint, buildUrl]);

  const prefetchPage = useCallback((targetCategory: string, targetSearchQuery = '') => {
    if (!targetCategory || normalizeSearchQuery(targetSearchQuery)) return;
    const targetRequestKey = buildRequestKey(apiEndpoint, targetCategory, targetSearchQuery);
    const pageKey = buildPageKey(targetRequestKey, 1);
    if (pageCacheRef.current.has(pageKey) || inflightRequestsRef.current.has(pageKey)) return;

    fetchPage(targetCategory, targetSearchQuery, 1).catch(() => {
      // Prefetch is opportunistic; interactive requests surface real errors.
    });
  }, [apiEndpoint, fetchPage]);

  // category/search 变化时重置
  useEffect(() => {
    const requestSeq = activeRequestSeqRef.current + 1;
    activeRequestSeqRef.current = requestSeq;
    const pageKey = buildPageKey(requestKey, 1);
    const cached = pageCacheRef.current.get(pageKey);
    if (cached) {
      setAllSymbols(cached.symbols);
      setCurrentPage(cached.page);
      setHasMore(cached.hasMore);
      setLoadingMore(false);
      setFailedRequestKey(null);
      setLoadedRequestKey(requestKey);
      return;
    }

    if (isInitialRequest && !hasRequestedDynamicDataRef.current) {
      return;
    }

    if (loadedRequestKey === requestKey) return;

    hasRequestedDynamicDataRef.current = true;
    const controller = new AbortController();

    fetchPage(category, searchQuery, 1, controller.signal)
      .then((data: PaginatedSymbolResponse) => {
        if (activeRequestSeqRef.current !== requestSeq) return;
        setAllSymbols(data.symbols);
        setCurrentPage(1);
        setHasMore(data.hasMore);
        setLoadingMore(false);
        setFailedRequestKey(null);
        setLoadedRequestKey(requestKey);
      })
      .catch(err => {
        if (err.name !== 'AbortError' && activeRequestSeqRef.current === requestSeq) {
          setFailedRequestKey(requestKey);
        }
      });

    return () => controller.abort();
  }, [category, fetchPage, isInitialRequest, loadedRequestKey, requestKey, retryCount, searchQuery]);

  useEffect(() => {
    if (normalizeSearchQuery(searchQuery)) return;

    const prefetch = () => {
      prefetchCategories.forEach((prefetchCategory) => {
        prefetchPage(prefetchCategory);
      });
    };

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(prefetch, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }

    const id = setTimeout(prefetch, 500);
    return () => clearTimeout(id);
  }, [prefetchCategories, prefetchPage, searchQuery]);

  useEffect(() => {
    if (!prefetchRequest || normalizeSearchQuery(searchQuery)) return;
    prefetchPage(prefetchRequest.category);
  }, [prefetchPage, prefetchRequest, searchQuery]);

  // 加载下一页
  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPage = currentPage + 1;
    const targetRequestKey = requestKey;

    fetchPage(category, searchQuery, nextPage)
      .then((data: PaginatedSymbolResponse) => {
        if (currentRequestKeyRef.current !== targetRequestKey) {
          setLoadingMore(false);
          return;
        }
        setAllSymbols(prev => [...prev, ...data.symbols]);
        setCurrentPage(nextPage);
        setHasMore(data.hasMore);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [category, currentPage, fetchPage, hasMore, loadingMore, requestKey, searchQuery]);

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
          onClick={() => {
            setFailedRequestKey(null);
            setRetryCount(count => count + 1);
          }}
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
        {allSymbols.map((symbol) => (
          <SymbolCard
            key={symbol.id ?? symbol.symbol}
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
