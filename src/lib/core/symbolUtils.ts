// 符号搜索和排序工具函数
import { SymbolData } from './types';

/**
 * 搜索符号数据
 * @param symbols 符号数组
 * @param query 搜索查询字符串
 * @returns 匹配的符号数组
 */
export function searchSymbols(symbols: SymbolData[], query: string): SymbolData[] {
  if (!query.trim()) {
    return symbols;
  }

  const lowerQuery = query.toLowerCase().trim();
  
  return symbols.filter(symbol => {
    // 基础搜索逻辑
    const basicMatch = 
      symbol.symbol.toLowerCase().includes(lowerQuery) ||
      symbol.name.toLowerCase().includes(lowerQuery) ||
      symbol.notes.toLowerCase().includes(lowerQuery) ||
      symbol.searchTerms.some((term: string) => term.toLowerCase().includes(lowerQuery));
    const pinyinMatch = (symbol._searchPinyin ?? [])
      .some(termPinyin => termPinyin.includes(lowerQuery));
    
    return basicMatch || pinyinMatch;
  });
}

/**
 * 按分类过滤符号
 * @param symbols 符号数组
 * @param category 分类ID，'all' 表示全部
 * @returns 过滤后的符号数组
 */
export function filterSymbolsByCategory(symbols: SymbolData[], category: string): SymbolData[] {
  if (category === 'all') {
    return symbols;
  }
  return symbols.filter(symbol => symbol.category.includes(category));
}

/**
 * 产生一个基于种子的随机数生成器 (简单的 LCG 算法)
 * @param seed 种子数字
 * @returns 随机数生成函数
 */
function createSeededRandom(seed: number) {
  return function() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

/**
 * 随机打乱数组 (使用可选种子保证确定性)
 * @param array 原始数组
 * @param seed 随机种子
 * @returns 打乱后的新数组
 */
export function shuffleArray<T>(array: T[], seed?: number): T[] {
  const newArray = [...array];
  const random = seed !== undefined ? createSeededRandom(seed) : () => Math.random();
  
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 排序符号数据
 * @param symbols 符号数组
 * @param category 当前分类
 * @param hasSearchQuery 是否有搜索查询
 * @returns 排序后的符号数组
 */
export function sortSymbols(symbols: SymbolData[], category: string, hasSearchQuery: boolean): SymbolData[] {
  // 如果有搜索查询，保持搜索结果的原始顺序
  if (hasSearchQuery) {
    return symbols;
  }
  
  if (category === 'all') {
    return symbols; // "全部"分类保持服务端已打乱的顺序
  }
  return [...symbols].sort((a, b) => a.symbol.localeCompare(b.symbol));
}
