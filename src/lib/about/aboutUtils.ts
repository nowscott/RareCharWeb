import { DataManifest } from '../data/localData';

// 类型定义
export interface CategoryStat {
  name: string;
  count: number;
}

export interface AboutDatasetSummary {
  key: 'symbols' | 'emojis';
  label: string;
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

function toNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function getManifestCategories(
  manifest: DataManifest,
  type: 'symbols' | 'emojis'
): CategoryStat[] {
  const categories = manifest.outputs?.[type]?.byCategory;
  if (!Array.isArray(categories) || categories.length === 0) {
    return [];
  }

  return categories
    .map((category) => ({
      name: typeof category.name === 'string' ? category.name : String(category.id ?? ''),
      count: toNumber(category.count)
    }))
    .filter((category) => category.name && category.count > 0);
}

export function generateDataOverview(
  manifest: DataManifest
): AboutDataOverview {
  const datasetConfigs = [
    {
      key: 'symbols' as const,
      label: '符号库'
    },
    {
      key: 'emojis' as const,
      label: 'Emoji 库'
    }
  ];

  const datasets = datasetConfigs.map(({ key, label }) => {
    const dataset = manifest.datasets?.[key];
    const categories = getManifestCategories(manifest, key);
    const online = toNumber(dataset?.online, categories.reduce((sum, category) => sum + category.count, 0));
    const pending = toNumber(dataset?.pending);
    const total = toNumber(dataset?.total, online + pending);

    return {
      key,
      label,
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
