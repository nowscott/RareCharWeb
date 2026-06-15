'use client';

import React from 'react';

interface SkeletonGridProps {
  /** 骨架卡片的数量 */
  count?: number;
}

/**
 * 骨架屏网格 — 与真实 SymbolCard 网格布局完全一致
 * 使用 Tailwind animate-pulse 实现闪烁动画，消除 CLS
 */
const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 24 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 flex flex-col items-center justify-center h-28 sm:h-32 animate-pulse"
        >
          {/* 符号占位 */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg mb-1 sm:mb-2" />
          {/* 名称占位 */}
          <div className="w-16 sm:w-20 h-3 sm:h-3.5 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      ))}
    </div>
  );
};

export default SkeletonGrid;
