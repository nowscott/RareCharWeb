'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Grid } from 'react-window';
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
const CARD_HEIGHT = 144;
const MOBILE_CARD_HEIGHT = 124;

function getColumnCount(width: number): number {
  if (width >= 1280) return 6;
  if (width >= 1024) return 5;
  if (width >= 768) return 4;
  if (width >= 640) return 3;
  return 2;
}

const SymbolList: React.FC<SymbolListProps> = ({ apiEndpoint, category, searchQuery }) => {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolData | null>(null);
  const [allSymbols, setAllSymbols] = useState<SymbolData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const seedRef = useRef(Date.now());

  // 监听容器尺寸
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: window.innerHeight - rect.top - 20 });
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener('resize', updateSize);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateSize);
    };
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
    seedRef.current = Date.now();
    setAllSymbols([]);
    setTotalCount(0);
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
        setTotalCount(data.total);
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
  }, [buildUrl]);

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
        setTotalCount(data.total);
        setCurrentPage(nextPage);
        setHasMore(data.hasMore);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [currentPage, hasMore, loadingMore, buildUrl]);

  const columnCount = getColumnCount(dimensions.width);
  const isMobile = dimensions.width < 640;
  const rowHeight = isMobile ? MOBILE_CARD_HEIGHT : CARD_HEIGHT;
  const columnWidth = dimensions.width / columnCount;
  const rowCount = Math.max(1, Math.ceil(totalCount / columnCount) + (hasMore ? 1 : 0));

  // 滚动到底部附近时加载更多
  const handleCellsRendered = useCallback(
    (visibleCells: { rowStopIndex: number }) => {
      if (visibleCells.rowStopIndex >= rowCount - 3 && hasMore && !loadingMore) {
        loadMore();
      }
    },
    [rowCount, hasMore, loadingMore, loadMore]
  );

  // 单元格渲染组件
  const CellRenderer = useCallback(
    ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
      const index = rowIndex * columnCount + columnIndex;

      if (index >= allSymbols.length) {
        return (
          <div style={style} className="flex items-center justify-center p-1.5 sm:p-2">
            <div className="w-full h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center animate-pulse">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            </div>
          </div>
        );
      }

      const symbol = allSymbols[index];
      return (
        <div style={style} className="p-1.5 sm:p-2">
          <SymbolCard
            symbol={symbol}
            onClick={() => setSelectedSymbol(symbol)}
          />
        </div>
      );
    },
    [allSymbols, columnCount]
  );

  if (loading) {
    return (
      <div ref={containerRef}>
        <SkeletonGrid count={columnCount * 3} />
      </div>
    );
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
                setTotalCount(data.total);
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
    <div ref={containerRef}>
      <Grid
        cellComponent={CellRenderer}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellProps={{} as any}
        columnCount={columnCount}
        columnWidth={columnWidth}
        defaultHeight={dimensions.height}
        rowCount={rowCount}
        rowHeight={rowHeight}
        defaultWidth={dimensions.width}
        onCellsRendered={handleCellsRendered}
        overscanCount={2}
      />

      {loadingMore && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {selectedSymbol && (
        <SymbolDetail
          symbol={selectedSymbol}
          onClose={() => setSelectedSymbol(null)}
        />
      )}
    </div>
  );
};

export default SymbolList;
