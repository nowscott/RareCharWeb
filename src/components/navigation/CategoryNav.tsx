'use client';

import React, { useState } from 'react';

// 分类信息接口
interface CategoryInfo {
  id: string;
  name: string;
  count: number;
}

interface CategoryNavProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
  onPrefetchCategory?: (category: string) => void;
  categories: CategoryInfo[]; // 动态生成的分类列表
}

const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  onPrefetchCategory,
  categories = []
}) => {
  const [expanded, setExpanded] = useState(false);

  // 如果categories为空，显示加载中
  if (!categories || categories.length === 0) {
    return (
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin category-scroll">
        <div className="flex space-x-2 min-w-max">
          <div className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700">
            加载分类中...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className={`w-full pb-2 scrollbar-thin category-scroll ${expanded ? 'overflow-visible' : 'overflow-x-auto'}`}>
        <div className={`flex gap-2 sm:gap-3 px-1 ${expanded ? 'flex-wrap' : 'min-w-max'}`}>
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => onSelectCategory(category.id)}
              onFocus={() => onPrefetchCategory?.(category.id)}
              onPointerEnter={() => onPrefetchCategory?.(category.id)}
              onTouchStart={() => onPrefetchCategory?.(category.id)}
              className={`category-chip px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${activeCategory === category.id
                ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500'
              }`}
            >
              {category.name} {activeCategory === category.id && <span className="text-xs ml-1">({category.count})</span>}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
      >
        {expanded ? '收起分类' : '展开全部分类'}
      </button>
    </div>
  );
};

export default CategoryNav;
