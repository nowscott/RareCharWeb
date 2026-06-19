import { AboutDataOverview } from '@/lib/about/aboutUtils';

interface DataOverviewSectionProps {
  overview: AboutDataOverview;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('zh-CN').format(value);
}

function formatGeneratedAt(value: string | null) {
  if (!value) return '未知';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '未知';

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);
}

export function DataOverviewSection({ overview }: DataOverviewSectionProps) {
  const cards = [
    { label: '已上线条目', value: formatNumber(overview.totalOnline), tone: 'text-blue-600 dark:text-blue-400' },
    { label: '分类总数', value: formatNumber(overview.totalCategories), tone: 'text-purple-600 dark:text-purple-400' },
    { label: '待清洗储备', value: formatNumber(overview.totalPending), tone: 'text-amber-600 dark:text-amber-400' }
  ];

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8 mb-6 sm:mb-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-5 sm:mb-6">
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">数据概览</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            展示当前已上线数据和分类覆盖，待清洗数据仅用于说明储备规模。
          </p>
        </div>
        <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-500">
          生成时间：{formatGeneratedAt(overview.generatedAt)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.label} className="rounded-lg bg-gray-50 dark:bg-gray-900/60 p-3 sm:p-4 text-center">
            <div className={`text-lg sm:text-2xl font-bold ${card.tone}`}>{card.value}</div>
            <div className="mt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {overview.datasets.map((dataset) => (
          <div key={dataset.key} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">{dataset.label}</h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {dataset.categoryCount} 个分类
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(dataset.online)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">已上线</div>
              </div>
            </div>

            <div className="space-y-2">
              {dataset.topCategories.map((category) => {
                const percent = dataset.online > 0 ? Math.round((category.count / dataset.online) * 100) : 0;

                return (
                  <div key={category.name}>
                    <div className="flex justify-between text-xs sm:text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{category.name}</span>
                      <span className="text-gray-500 dark:text-gray-400">{formatNumber(category.count)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
