import { SymbolData } from '../core/types';
import { DataManifest } from '../data/localData';

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

export interface AboutDatasetSummary {
  key: 'symbols' | 'emojis';
  label: string;
  version: string;
  online: number;
  pending: number;
  total: number;
  categoryCount: number;
  topCategories: CategoryStat[];
}

export interface AboutDataOverview {
  generatedAt: string | null;
  totalOnline: number;
  totalPending: number;
  totalCategories: number;
  datasets: AboutDatasetSummary[];
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

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getManifestCategories(
  manifest: DataManifest,
  type: 'symbols' | 'emojis',
  fallbackCategoryStats: CategoryStat[]
): CategoryStat[] {
  const categories = manifest.outputs?.[type]?.byCategory;
  if (!Array.isArray(categories) || categories.length === 0) {
    return fallbackCategoryStats;
  }

  return categories
    .map((category) => ({
      name: typeof category.name === 'string' ? category.name : String(category.id ?? ''),
      count: toNumber(category.count)
    }))
    .filter((category) => category.name && category.count > 0);
}

export function generateDataOverview(
  manifest: DataManifest,
  versions: AboutVersions,
  symbolCategoryStats: CategoryStat[],
  emojiCategoryStats: CategoryStat[]
): AboutDataOverview {
  const datasetConfigs = [
    {
      key: 'symbols' as const,
      label: '符号库',
      version: versions.symbol,
      fallbackCategories: symbolCategoryStats
    },
    {
      key: 'emojis' as const,
      label: 'Emoji 库',
      version: versions.emoji,
      fallbackCategories: emojiCategoryStats
    }
  ];

  const datasets = datasetConfigs.map(({ key, label, version, fallbackCategories }) => {
    const dataset = manifest.datasets?.[key];
    const categories = getManifestCategories(manifest, key, fallbackCategories);
    const online = toNumber(dataset?.online, categories.reduce((sum, category) => sum + category.count, 0));
    const pending = toNumber(dataset?.pending);
    const total = toNumber(dataset?.total, online + pending);

    return {
      key,
      label,
      version,
      online,
      pending,
      total,
      categoryCount: categories.length,
      topCategories: [...categories].sort((a, b) => b.count - a.count).slice(0, 5)
    };
  });

  return {
    generatedAt: typeof manifest.generatedAt === 'string' ? manifest.generatedAt : null,
    totalOnline: datasets.reduce((sum, dataset) => sum + dataset.online, 0),
    totalPending: datasets.reduce((sum, dataset) => sum + dataset.pending, 0),
    totalCategories: datasets.reduce((sum, dataset) => sum + dataset.categoryCount, 0),
    datasets
  };
}
