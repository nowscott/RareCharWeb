'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { SymbolData } from '@/lib/core/types';
import SymbolCard from './SymbolCard';
import SymbolDetail from './SymbolDetail';

interface SymbolListProps {
  displayedSymbols: SymbolData[];
  searchQuery: string;
}

const SymbolList: React.FC<SymbolListProps> = ({
  displayedSymbols,
  searchQuery
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolData | null>(null);
  const [visibleCount, setVisibleCount] = useState(180);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisibleCount(180);
    }, 0);
    return () => clearTimeout(timer);
  }, [displayedSymbols, searchQuery]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    if (visibleCount >= displayedSymbols.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisibleCount((prev) => Math.min(prev + 180, displayedSymbols.length));
        }
      },
      { rootMargin: '800px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [displayedSymbols.length, visibleCount]);

  const visibleSymbols = useMemo(() => {
    return displayedSymbols.slice(0, visibleCount);
  }, [displayedSymbols, visibleCount]);

  return (
    <>
      {displayedSymbols.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {visibleSymbols.map((symbol, index) => (
              <SymbolCard 
                key={`${symbol.symbol}-${index}`} 
                symbol={symbol} 
                onClick={() => setSelectedSymbol(symbol)} 
              />
            ))}
          </div>
          {visibleCount < displayedSymbols.length ? (
            <div ref={sentinelRef} className="h-10" />
          ) : null}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchQuery ? '没有找到匹配的符号' : '没有符号可显示'}
          </p>
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
