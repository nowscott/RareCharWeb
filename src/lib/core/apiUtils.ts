import { SymbolData, CategoryStat } from './types';

/**
 * 计算分类统计信息
 * @param symbols 符号数组
 * @returns 统计后的分类数组
 */
export function calculateCategoryStats(symbols: SymbolData[]): CategoryStat[] {
  const categoryCounts: Record<string, number> = {};
  
  symbols.forEach(symbol => {
    if (symbol.category && symbol.category.length > 0) {
      symbol.category.forEach(cat => {
        if (categoryCounts[cat]) {
          categoryCounts[cat]++;
        } else {
          categoryCounts[cat] = 1;
        }
      });
    }
  });
  
  // 转换为统计数组并排序
  const stats = Object.keys(categoryCounts)
    .map(id => ({
      id,
      name: id, // 直接使用分类名称，因为已经是中文
      count: categoryCounts[id]
    }))
    .sort((a, b) => b.count - a.count);

  return stats;
}
