import { aboutConfig } from '@/lib/about/aboutConfig';
import { AboutVersions, AboutStats } from '@/lib/about/aboutUtils';

// 版本信息组件
interface VersionSectionProps {
  versions: AboutVersions;
  stats: AboutStats;
}

export function VersionSection({ versions, stats }: VersionSectionProps) {
  const labels = aboutConfig.versionLabels;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sm:p-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">版本信息</h3>
      <div className="space-y-3 sm:space-y-4">
        <div className="py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{labels.dataVersion}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{labels.symbolData}</span>
              <span className="font-semibold text-xs sm:text-sm text-blue-600">{versions.symbol}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm">{labels.emojiData}</span>
              <span className="font-semibold text-xs sm:text-sm text-purple-600">{versions.emoji}</span>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center py-2 sm:py-3 border-b border-gray-200 dark:border-gray-700">
          <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{labels.devStatus}</span>
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">{labels.devStatusValue}</span>
        </div>
        <div className="flex justify-between items-center py-2 sm:py-3">
          <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">{labels.totalSymbols}</span>
          <span className="font-semibold text-sm sm:text-base">{stats.totalSymbols}+</span>
        </div>
      </div>
    </div>
  );
}