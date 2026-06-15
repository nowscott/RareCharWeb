'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SymbolData } from '@/lib/core/types';
import SymbolCard from './SymbolCard';
import SymbolDetail from './SymbolDetail';
import SkeletonGrid from './SkeletonGrid';

interface SymbolListProps {
  apiEndpoint: string;
  category: string;
  searchQuery: string;
}

interface PaginatedAPIResponse {
  symbols: SymbolData[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

const PAGE_SIZE = 200;

const SymbolList: React.FC<SymbolListProps> = ({ apiEndpoint, category, searchQuery }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolData | null>(null);
  const [allSymbols, setAllSymbols] = useState<SymbolData[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const sentinelRef = useRef<HTMLDivElement>(null);
  const seedRef = useRef(Date.now());

  // 标记客户端已挂载
  useEffect(() => {
    setMounted(true);
  }, []);

  // 构建 API URL
  const buildUrl = useCallback((page: number) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(PAGE_SIZE));
    params.set('seed', String(seedRef.current));
    if (category && category !== 'all') params.set('category', category);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    return `${apiEndpoint}?${params.toString()}`;
  }, [apiEndpoint, category, searchQuery]);

  // category/search 变化时重置
  useEffect(() => {
    if (!mounted) return;

    seedRef.current = Date.now();
    setAllSymbols([]);
    setCurrentPage(0);
    setHasMore(true);
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    fetch(buildUrl(1), { signal: controller.signal })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: PaginatedAPIResponse) => {
        setAllSymbols(data.symbols);
        setCurrentPage(1);
        setHasMore(data.hasMore);
        setLoading(false);
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          setError('加载失败，请重试');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [buildUrl, mounted]);

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
      .then((data: PaginatedAPIResponse) => {
        setAllSymbols(prev => [...prev, ...data.symbols]);
        setCurrentPage(nextPage);
        setHasMore(data.hasMore);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [currentPage, hasMore, loadingMore, buildUrl]);

  // IntersectionObserver 滚动加载
  useEffect(() => {
    if (!mounted) return;
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
  }, [loading, loadingMore, hasMore, loadMore, mounted]);

  // 未挂载时返回空（避免 SSR 水合问题）
  if (!mounted) {
    return <SkeletonGrid count={12} />;
  }

  if (loading) {
    return <SkeletonGrid count={12} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 dark:text-red-400 mb-4">{error}</p>
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
            seedRef.current = Date.now();
            setAllSymbols([]);
            fetch(buildUrl(1))
              .then(res => res.json())
              .then((data: PaginatedAPIResponse) => {
                setAllSymbols(data.symbols);
                setCurrentPage(1);
                setHasMore(data.hasMore);
                setLoading(false);
              })
              .catch(() => {
                setError('加载失败，请重试');
                setLoading(false);
              });
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  if (allSymbols.length === 0) {
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
