import React, { memo, useState } from 'react';
import { SymbolData } from '@/lib/core/types';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { getSymbolClassName } from '@/lib/font/fontUtils';

interface SymbolCardProps {
  symbol: SymbolData;
  onSelect?: (symbol: SymbolData) => void;
}

const SymbolCard: React.FC<SymbolCardProps> = ({ symbol, onSelect }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const variantCount = 'variants' in symbol ? symbol.variants?.length ?? 0 : 0;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(symbol.symbol);
    // 简单的视觉反馈 - 变成绿色
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
    }, 1000);
  };

  return (
    <LiquidGlassSurface
      variant="card"
      onClick={() => onSelect?.(symbol)}
      className="liquid-card p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer h-24 sm:h-32 relative group touch-manipulation"
    >
      {variantCount > 0 && (
        <span className="absolute left-1.5 top-1.5 sm:left-2 sm:top-2 rounded-full bg-orange-100/80 px-2 py-0.5 text-[10px] font-medium text-orange-700 shadow-sm backdrop-blur-md dark:bg-orange-900/50 dark:text-orange-200">
          肤色
        </span>
      )}
      <button
        onClick={handleCopy}
        className={`absolute right-2 top-2 z-20 flex h-8 w-8 items-center justify-center rounded-full opacity-0 transition-all group-hover:opacity-100 focus-visible:opacity-100 touch-manipulation ${
          copySuccess
            ? 'text-green-400'
            : 'text-slate-700 hover:text-slate-950 dark:text-white/85 dark:hover:text-white active:scale-95'
        }`}
        title="复制符号"
        aria-label={`复制 ${symbol.name}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
      <div 
        className={`text-3xl sm:text-4xl mb-1 sm:mb-2 text-gray-950 dark:text-white ${getSymbolClassName('symbol-large symbol-center symbol-no-select')}`}
      >
        {symbol.symbol}
      </div>
      <div className="text-xs sm:text-sm liquid-text-muted text-center leading-tight px-5">{symbol.name}</div>
    </LiquidGlassSurface>
  );
};

export default memo(SymbolCard);
