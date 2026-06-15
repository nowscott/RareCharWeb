'use client';

import React from 'react';

interface SkeletonGridProps {
  /** 骨架卡片的数量 */
  count?: number;
}

const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 24 }) => {
  const nameWidths = ['w-14 sm:w-16', 'w-16 sm:w-20', 'w-20 sm:w-24'];
  const getVisibilityClass = (index: number) => {
    if (index < 8) return 'flex';
    if (index < 12) return 'hidden sm:flex';
    if (index < 16) return 'hidden md:flex';
    if (index < 20) return 'hidden lg:flex';
    return 'hidden xl:flex';
  };

  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">正在加载符号</span>
      <div
        aria-hidden="true"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4"
      >
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className={`relative isolate overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-3 sm:p-4 flex-col items-center justify-center h-28 sm:h-32 ${getVisibilityClass(index)}`}
          >
            <div className="skeleton-shimmer absolute inset-0 z-0" />
            <div className="absolute z-10 top-1.5 right-1.5 sm:top-2 sm:right-2 w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-700/80" />
            <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-200/90 dark:bg-gray-700 mb-1.5 sm:mb-2" />
            <div
              className={`relative z-10 h-3 sm:h-3.5 rounded-full bg-gray-200/90 dark:bg-gray-700 ${nameWidths[index % nameWidths.length]}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkeletonGrid;
