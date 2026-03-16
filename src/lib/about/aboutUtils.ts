import { SymbolData } from '../core/types';

// 类型定义
export interface CategoryStat {
  name: string;
  count: number;
}

export interface AboutStats {
  totalSymbols: number;
  categoryStats: CategoryStat[];
}

export interface AboutVersions {
  symbol: string;
  emoji: string;
}

// 合并分类统计数据的工具函数
export function mergeCategoryStats(
  symbolCategoryStats: CategoryStat[],
  emojiCategoryStats: CategoryStat[]
): CategoryStat[] {
  const categoryMap = new Map<string, number>();
  
  // 合并符号分类统计
  symbolCategoryStats.forEach(stat => {
    categoryMap.set(stat.name, (categoryMap.get(stat.name) || 0) + stat.count);
  });
  
  // 合并emoji分类统计
  emojiCategoryStats.forEach(stat => {
    categoryMap.set(stat.name, (categoryMap.get(stat.name) || 0) + stat.count);
  });
  
  // 转换为数组并按数量排序
  return Array.from(categoryMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// 生成统计数据的工具函数
export function generateStats(
  symbolData: SymbolData[],
  emojiData: SymbolData[],
  symbolCategoryStats: CategoryStat[],
  emojiCategoryStats: CategoryStat[]
): AboutStats {
  const mergedCategoryStats = mergeCategoryStats(symbolCategoryStats, emojiCategoryStats);
  
  return {
    totalSymbols: symbolData.length + emojiData.length,
    categoryStats: mergedCategoryStats
  };
}

// 生成版本信息的工具函数
export function generateVersions(
  symbolVersion: string,
  emojiVersion: string
): AboutVersions {
  return {
    symbol: symbolVersion,
    emoji: emojiVersion
  };
}
