import React, { useState, useEffect, useRef } from 'react';
import { SymbolData } from '@/lib/core/types';
import { getSymbolClassName, applySymbolFont } from '@/lib/font/fontUtils';

interface SymbolCardProps {
  symbol: SymbolData | {
    symbol: string;
    name: string;
  };
  onClick?: () => void;
}

const SymbolCard: React.FC<SymbolCardProps> = ({ symbol, onClick }) => {
  const symbolRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    // 使用 setTimeout 延迟设置状态
    const timer = setTimeout(() => {
      setIsClient(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (symbolRef.current) {
      applySymbolFont(symbolRef.current);
    }
  }, [symbol.symbol, isClient]);
  
  const [copySuccess, setCopySuccess] = useState(false);

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
    <div 
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md active:shadow-lg transition-all duration-200 p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer border border-gray-100 dark:border-gray-700 h-28 sm:h-32 relative group touch-manipulation"
    >
      <button
        onClick={handleCopy}
        className={`absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-1 rounded-md transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0 touch-manipulation ${
          copySuccess 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600'
        }`}
        title="复制符号"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
          copySuccess ? 'text-white' : 'text-gray-500 dark:text-gray-400'
        }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>
      <div 
        ref={symbolRef}
        className={`text-3xl sm:text-4xl mb-1 sm:mb-2 ${isClient ? getSymbolClassName('symbol-large symbol-center symbol-no-select') : 'symbol-display symbol-large symbol-center symbol-no-select'}`}
      >
        {symbol.symbol}
      </div>
      <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-center leading-tight">{symbol.name}</div>
    </div>
  );
};

export default SymbolCard;