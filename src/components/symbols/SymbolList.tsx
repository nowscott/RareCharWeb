'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useWindowVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore
} from 'react';
import { PaginatedSymbolResponse, SymbolData } from '@/lib/core/types';
import {
  fetchSymbolPage,
  getSymbolQueryKey,
  normalizeSymbolSearch,
  SymbolListQuery,
  toInfiniteSymbolPage
} from '@/lib/data/symbolApi';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import SymbolCard from './SymbolCard';
import SymbolDetail from './SymbolDetail';

interface SymbolListProps {
  apiEndpoint: string;
  category: string;
  searchQuery: string;
  initialData: PaginatedSymbolResponse;
  initialSeed: number;
}

interface SymbolGridProps {
  symbols: SymbolData[];
  requestIdentity: string;
  onSelect: (symbol: SymbolData) => void;
  onLoadNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

interface VirtualScrollState {
  offset: number;
  measurements: VirtualItem[];
}

const GRID_CLASS = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4';
const MAX_SCROLL_STATES = 20;
const virtualScrollStates = new Map<string, VirtualScrollState>();

function subscribeHydration() {
  return () => undefined;
}

function useHydrated(): boolean {
  return useSyncExternalStore(subscribeHydration, () => true, () => false);
}

function getColumnCount(width: number): number {
  if (width >= 1280) return 6;
  if (width >= 1024) return 5;
  if (width >= 768) return 4;
  if (width >= 640) return 3;
  return 2;
}

function subscribeViewport(callback: () => void) {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getClientColumnCount(): number {
  return getColumnCount(window.innerWidth);
}

function useColumnCount(): number {
  return useSyncExternalStore(subscribeViewport, getClientColumnCount, () => 2);
}

function useElementPageTop(elementRef: RefObject<HTMLDivElement | null>): number {
  const getSnapshot = useCallback(() => {
    const element = elementRef.current;
    if (!element) return 0;
    return Math.round(element.getBoundingClientRect().top + window.scrollY);
  }, [elementRef]);

  const subscribe = useCallback((callback: () => void) => {
    const element = elementRef.current;
    if (!element) return () => undefined;

    const observer = new ResizeObserver(callback);
    observer.observe(element.parentElement ?? element);
    window.addEventListener('resize', callback);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', callback);
    };
  }, [elementRef]);

  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

function saveVirtualScrollState(identity: string, state: VirtualScrollState): void {
  virtualScrollStates.delete(identity);
  virtualScrollStates.set(identity, state);

  if (virtualScrollStates.size <= MAX_SCROLL_STATES) return;
  const oldestIdentity = virtualScrollStates.keys().next().value;
  if (oldestIdentity) virtualScrollStates.delete(oldestIdentity);
}

function StaticSymbolGrid({
  symbols,
  onSelect
}: Pick<SymbolGridProps, 'symbols' | 'onSelect'>) {
  return (
    <div className={GRID_CLASS}>
      {symbols.map((symbol) => (
        <SymbolCard
          key={symbol.id ?? symbol.symbol}
          symbol={symbol}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function ResponsiveVirtualSymbolGrid(props: SymbolGridProps) {
  const columnCount = useColumnCount();
  const layoutIdentity = `${props.requestIdentity}:${columnCount}`;

  return (
    <VirtualSymbolGrid
      key={layoutIdentity}
      {...props}
      columnCount={columnCount}
      layoutIdentity={layoutIdentity}
    />
  );
}

function VirtualSymbolGrid({
  symbols,
  onSelect,
  onLoadNextPage,
  hasNextPage,
  isFetchingNextPage,
  columnCount,
  layoutIdentity
}: SymbolGridProps & { columnCount: number; layoutIdentity: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  const [restoredState] = useState(() => virtualScrollStates.get(layoutIdentity));
  const lastUserScrollOffsetRef = useRef(restoredState?.offset ?? 0);
  const scrollMargin = useElementPageTop(listRef);
  const rowCount = Math.ceil(symbols.length / columnCount);
  const gap = columnCount === 2 ? 12 : 16;
  const estimatedRowHeight = columnCount === 2 ? 108 : 143;
  const restorationOptions = restoredState
    ? {
        initialOffset: restoredState.offset,
        initialMeasurementsCache: restoredState.measurements
      }
    : {};
  const virtualizer = useWindowVirtualizer<HTMLDivElement>({
    count: rowCount,
    estimateSize: () => estimatedRowHeight,
    gap,
    overscan: 5,
    scrollMargin,
    directDomUpdates: true,
    directDomUpdatesMode: 'transform',
    onChange: (instance, sync) => {
      if (sync && instance.scrollOffset !== null) {
        lastUserScrollOffsetRef.current = instance.scrollOffset;
      }
    },
    ...restorationOptions
  });
  const virtualRows = virtualizer.getVirtualItems();
  const lastVirtualRowIndex = virtualRows.at(-1)?.index;

  useEffect(() => {
    if (
      lastVirtualRowIndex === undefined ||
      !hasNextPage ||
      isFetchingNextPage ||
      symbols.length === 0
    ) {
      return;
    }

    const lastRenderedIndex = Math.min(
      symbols.length - 1,
      (lastVirtualRowIndex + 1) * columnCount - 1
    );
    if (lastRenderedIndex >= symbols.length - 10) onLoadNextPage();
  }, [
    columnCount,
    hasNextPage,
    isFetchingNextPage,
    lastVirtualRowIndex,
    onLoadNextPage,
    symbols.length
  ]);

  useEffect(() => {
    if (!restoredState) return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        virtualizer.scrollToOffset(restoredState.offset, { behavior: 'auto' });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
    };
  }, [restoredState, virtualizer]);

  useEffect(() => {
    let isLeavingRoute = false;

    const saveCurrentState = () => {
      saveVirtualScrollState(layoutIdentity, {
        offset: lastUserScrollOffsetRef.current,
        measurements: virtualizer.takeSnapshot()
      });
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;

      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin || destination.href === window.location.href) {
        return;
      }

      // Next resets native scroll before unmounting the old route. Snapshot first
      // so the cleanup does not replace the real position with zero.
      isLeavingRoute = true;
      saveCurrentState();
    };

    const handleHistoryNavigation = () => {
      isLeavingRoute = true;
      saveCurrentState();
    };

    document.addEventListener('click', handleDocumentClick, true);
    window.addEventListener('popstate', handleHistoryNavigation);
    window.addEventListener('pagehide', handleHistoryNavigation);

    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
      window.removeEventListener('popstate', handleHistoryNavigation);
      window.removeEventListener('pagehide', handleHistoryNavigation);
      if (!isLeavingRoute) saveCurrentState();
    };
  }, [layoutIdentity, virtualizer]);

  return (
    <div ref={listRef}>
      <div ref={virtualizer.containerRef} className="relative w-full">
        {/* TanStack Virtual exposes its render range through this getter. */}
        {/* eslint-disable-next-line react-hooks/refs */}
        {virtualRows.map((virtualRow) => {
          const rowStart = virtualRow.index * columnCount;
          const rowSymbols = symbols.slice(rowStart, rowStart + columnCount);

          return (
            <div
              key={virtualRow.key}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              className={`${GRID_CLASS} absolute left-0 top-0 w-full`}
            >
              {rowSymbols.map((symbol) => (
                <SymbolCard
                  key={symbol.id ?? symbol.symbol}
                  symbol={symbol}
                  onSelect={onSelect}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const SymbolList: React.FC<SymbolListProps> = ({
  apiEndpoint,
  category,
  searchQuery,
  initialData,
  initialSeed
}) => {
  const [selection, setSelection] = useState<{
    requestIdentity: string;
    symbol: SymbolData;
  } | null>(null);
  const hydrated = useHydrated();
  const query: SymbolListQuery = {
    apiEndpoint,
    category,
    searchQuery,
    seed: initialSeed
  };
  const queryKey = getSymbolQueryKey(query);
  const requestIdentity = JSON.stringify(queryKey);
  const isInitialRequest = category === 'all' && normalizeSymbolSearch(searchQuery) === '';
  const selectedSymbol = selection?.requestIdentity === requestIdentity
    ? selection.symbol
    : null;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchNextPageError,
    isFetchingNextPage,
    isPending,
    isRefetching,
    refetch
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam, signal }) => fetchSymbolPage(query, pageParam, signal),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialData: isInitialRequest
      ? {
          pages: [toInfiniteSymbolPage(initialData)],
          pageParams: [1]
        }
      : undefined
  });

  const listData = data?.pages.flatMap((page) => page.data) ?? [];

  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage({ cancelRefetch: false });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const handleSelect = useCallback((symbol: SymbolData) => {
    setSelection({ requestIdentity, symbol });
  }, [requestIdentity]);

  if (isError && listData.length === 0) {
    return (
      <div className="text-center py-12">
        <LiquidGlassSurface variant="panel" className="inline-flex flex-col items-center gap-4 p-6">
          <p className="text-red-500 dark:text-red-300">加载失败，请重试</p>
          <LiquidGlassSurface variant="pill" active tone="symbol">
            <button onClick={() => void refetch()} className="px-5 py-2 text-white">
              重试
            </button>
          </LiquidGlassSurface>
        </LiquidGlassSurface>
      </div>
    );
  }

  if (listData.length === 0 && !isPending) {
    return (
      <div className="py-10 text-center">
        <p className="text-sm sm:text-base liquid-text-muted">
          {searchQuery ? '没有找到匹配的符号' : '没有符号可显示'}
        </p>
      </div>
    );
  }

  return (
    <>
      {(isPending || isRefetching) && (
        <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
          <LiquidGlassSurface variant="status" className="px-3 py-1.5 text-xs liquid-text-muted" role="status">
            正在更新结果...
          </LiquidGlassSurface>
        </div>
      )}

      {hydrated ? (
        <ResponsiveVirtualSymbolGrid
          symbols={listData}
          requestIdentity={requestIdentity}
          onSelect={handleSelect}
          onLoadNextPage={loadNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      ) : (
        <StaticSymbolGrid symbols={listData} onSelect={handleSelect} />
      )}

      {hasNextPage && (
        <div className="py-4 flex justify-center">
          {isFetchingNextPage ? (
            <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
          ) : isFetchNextPageError ? (
            <LiquidGlassSurface variant="pill" active tone="symbol">
              <button onClick={loadNextPage} className="px-4 py-2 text-sm text-white">
                加载失败，点击重试
              </button>
            </LiquidGlassSurface>
          ) : (
            <div className="h-10" />
          )}
        </div>
      )}

      {selectedSymbol && (
        <SymbolDetail
          symbol={selectedSymbol}
          onClose={() => setSelection(null)}
        />
      )}
    </>
  );
};

export default SymbolList;
