import React, { useState, useRef, useEffect } from 'react';
import { SymbolData, SymbolVariantData } from '@/lib/core/types';
import { getSymbolClassName, applySymbolFont } from '@/lib/font/fontUtils';

interface SymbolDetailProps {
  symbol: SymbolData | null;
  onClose: () => void;
}

const SymbolDetail: React.FC<SymbolDetailProps> = ({ symbol, onClose }) => {
  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [showScrollGradient, setShowScrollGradient] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<{
    symbolKey: string;
    variantSymbol: string;
  } | null>(null);
  const symbolRef = useRef<HTMLDivElement>(null);
  const notesContentRef = useRef<HTMLDivElement>(null);
  const variants = symbol?.variants ?? [];
  const symbolKey = symbol?.id ?? symbol?.symbol ?? '';
  const selectedVariantSymbol = selectedVariant?.symbolKey === symbolKey ? selectedVariant.variantSymbol : null;
  const activeVariant = variants.find((variant) => variant.symbol === selectedVariantSymbol);
  const activeSymbol = getActiveSymbol(symbol, activeVariant);
  const activeSymbolValue = activeSymbol?.symbol;
  
  useEffect(() => {
    if (symbolRef.current && activeSymbolValue) {
      applySymbolFont(symbolRef.current);
    }
  }, [activeSymbolValue]);

  // 禁用页面滚动
  useEffect(() => {
    if (symbol) {
      // 保存当前的overflow样式
      const originalOverflow = document.body.style.overflow;
      // 禁用滚动
      document.body.style.overflow = 'hidden';
      
      // 清理函数：恢复滚动
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [symbol]);

  // 检测说明内容是否需要滚动
  useEffect(() => {
    if (notesContentRef.current && activeSymbol?.notes) {
      const element = notesContentRef.current;
      const hasOverflow = element.scrollHeight > element.clientHeight;
      
      if (hasOverflow) {
        // 初始设置 - 使用 setTimeout 避免同步更新
        setTimeout(() => {
          setShowScrollGradient(true);
        }, 0);

        const handleScroll = () => {
          const isAtBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1;
          setShowScrollGradient(!isAtBottom);
        };
        
        // 添加滚动事件监听器
        element.addEventListener('scroll', handleScroll);
        
        // 清理函数
        return () => {
          element.removeEventListener('scroll', handleScroll);
        };
      } else {
        setTimeout(() => setShowScrollGradient(false), 0);
      }
    } else {
      setTimeout(() => setShowScrollGradient(false), 0);
    }
  }, [activeSymbol?.notes]);
  
  if (!symbol || !activeSymbol) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSymbol.symbol);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 2000);
  };

  return (
    <div 
      className="fixed inset-0 backdrop-blur-md bg-black/30 dark:bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/50 rounded-3xl max-w-lg w-full shadow-2xl transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <div className="absolute top-4 right-4 z-10">
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 dark:bg-gray-700/80 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-gray-600/80 transition-all duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 主要内容区域 */}
        <div className="p-6 pt-16">
          {/* 符号展示区域 */}
          <div className="text-center mb-6">
            <div 
              ref={symbolRef}
              className={`text-6xl mb-4 ${getSymbolClassName('symbol-large symbol-center symbol-no-select')}`}
            >
              {activeSymbol.symbol}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{activeSymbol.name}</h2>
            {symbol.pronunciation && (
              <p className="text-gray-600 dark:text-gray-400">
                发音: {symbol.pronunciation}
              </p>
            )}
          </div>

          {/* 信息卡片区域 */}
          <div className="space-y-2">
            {variants.length > 0 && (
              <div className="bg-orange-50/90 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-200/60 dark:border-orange-800/50">
                <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-200 mb-2">肤色变体:</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedVariant(null)}
                    aria-pressed={!selectedVariantSymbol}
                    className={getToneButtonClassName(!selectedVariantSymbol)}
                  >
                    默认 {symbol.symbol}
                  </button>
                  {variants.map((variant) => (
                    <button
                      key={variant.symbol}
                      onClick={() => setSelectedVariant({ symbolKey, variantSymbol: variant.symbol })}
                      aria-pressed={selectedVariantSymbol === variant.symbol}
                      className={getToneButtonClassName(selectedVariantSymbol === variant.symbol)}
                      title={variant.name}
                    >
                      {variant.symbol}
                      {variant.toneLabel && <span className="ml-1 hidden sm:inline">{variant.toneLabel}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 分类信息 */}
            <div className="bg-gray-100/90 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/30">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">分类:</span>
                <div className="flex flex-wrap gap-2">
                  {symbol.category.map((cat, index) => (
                    <span 
                      key={index} 
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Unicode 信息 */}
            {activeSymbol.symbol && (
              <div className="bg-gray-100/90 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Unicode:</span>
                  <span className="text-gray-600 dark:text-gray-400 font-mono text-sm">
                    {Array.from(activeSymbol.symbol).map((char) => {
                      const codePoint = char.codePointAt(0);
                      return codePoint ? `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}` : '';
                    }).filter(Boolean).join(' ')}
                  </span>
                </div>
              </div>
            )}

            {/* 说明信息 */}
            {activeSymbol.notes && (
              <div className="bg-gray-100/90 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-200/50 dark:border-gray-600/30">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">说明:</h3>
                <div className="relative">
                  <div 
                    ref={notesContentRef}
                    className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-h-32 overflow-y-auto scrollbar-thin pl-2 pr-1"
                  >
                    {activeSymbol.notes.split('\n').map((line, index) => (
                      <p key={index} className={index > 0 ? 'mt-2' : ''}>
                        {line}
                      </p>
                    ))}
                  </div>
                  {/* 滚动提示渐变 - 仅在内容溢出时显示 */}
                  {showScrollGradient && (
                    <div className="absolute bottom-0 left-2 right-1 h-6 bg-gradient-to-t from-gray-100 via-gray-100/80 to-transparent dark:from-gray-700/50 dark:via-gray-700/70 dark:to-transparent pointer-events-none" />
                  )}

                </div>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="mt-6 flex justify-center relative">
            <button
              onClick={handleCopy}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              复制符号
            </button>
            
            {/* 复制成功提示 */}
            {showCopySuccess && (
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg animate-pulse">
                复制成功！
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function getActiveSymbol(
  symbol: SymbolData | null,
  variant: SymbolVariantData | undefined
): SymbolData | null {
  if (!symbol || !variant) return symbol;

  return {
    ...symbol,
    symbol: variant.symbol,
    name: variant.name,
    searchTerms: variant.searchTerms,
    notes: variant.notes
  };
}

function getToneButtonClassName(active: boolean): string {
  const baseClass = 'px-3 py-1.5 rounded-full text-sm transition-colors';
  if (active) return baseClass + ' bg-orange-600 text-white';

  return baseClass + ' bg-white text-orange-800 hover:bg-orange-100 dark:bg-gray-800 dark:text-orange-200 dark:hover:bg-orange-900/40';
}

export default SymbolDetail;
