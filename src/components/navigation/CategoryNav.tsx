import React from 'react';

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
  // 如果categories为空，显示加载中
  if (!categories || categories.length === 0) {
    return (
      <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex space-x-2 min-w-max">
          <div className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700">
            加载分类中...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
      <div className="flex space-x-2 sm:space-x-3 min-w-max px-1">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            onFocus={() => onPrefetchCategory?.(category.id)}
            onPointerEnter={() => onPrefetchCategory?.(category.id)}
            onTouchStart={() => onPrefetchCategory?.(category.id)}
            className={`px-3 py-2 sm:px-4 sm:py-2 rounded-full text-sm sm:text-base font-medium transition-colors whitespace-nowrap touch-manipulation ${activeCategory === category.id
              ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-800'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 active:bg-gray-300 dark:active:bg-gray-500'
            }`}
          >
            {category.name} {activeCategory === category.id && <span className="text-xs ml-1">({category.count})</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryNav;
