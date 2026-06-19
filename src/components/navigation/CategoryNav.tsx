'use client';

import React, { useState } from 'react';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';

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
          <LiquidGlassSurface variant="pill" className="px-4 py-2 text-sm font-medium liquid-text-muted">
            加载分类中...
          </LiquidGlassSurface>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className={`w-full pb-2 scrollbar-thin category-scroll ${expanded ? 'overflow-visible' : 'overflow-x-auto'}`}>
        <div className={`flex gap-2 sm:gap-3 px-1 ${expanded ? 'flex-wrap' : 'min-w-max'}`}>
          {categories.map((category) => (
            <LiquidGlassSurface
              key={category.id}
              variant="pill"
              active={activeCategory === category.id}
              tone="symbol"
            >
              <button
                type="button"
                onClick={() => onSelectCategory(category.id)}
                onFocus={() => onPrefetchCategory?.(category.id)}
                onPointerEnter={() => onPrefetchCategory?.(category.id)}
                onTouchStart={() => onPrefetchCategory?.(category.id)}
                className={`category-chip liquid-focus px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base font-medium whitespace-nowrap ${activeCategory === category.id
                  ? 'text-white'
                  : 'liquid-text-muted active:scale-95'
                }`}
              >
                {category.name} {activeCategory === category.id && <span className="text-xs ml-1">({category.count})</span>}
              </button>
            </LiquidGlassSurface>
          ))}
        </div>
      </div>
      <LiquidGlassSurface variant="pill">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="liquid-focus px-2 py-1 text-[11px] leading-none sm:text-xs liquid-text-muted hover:text-gray-950 dark:hover:text-white"
        >
          {expanded ? '收起分类' : '展开全部分类'}
        </button>
      </LiquidGlassSurface>
    </div>
  );
};

export default CategoryNav;
