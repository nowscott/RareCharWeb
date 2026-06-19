import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { aboutConfig } from '@/lib/about/aboutConfig';

// 使用说明组件
export function InstructionsSection() {
  return (
    <LiquidGlassSurface variant="panel" className="p-6 sm:p-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">使用说明</h3>
      <div className="space-y-3 sm:space-y-4">
        {aboutConfig.instructions.map((instruction, index) => (
          <div key={index} className="flex items-center space-x-3 rounded-2xl border border-white/30 bg-white/20 p-3 dark:bg-gray-900/20">
            <span className="bg-gradient-to-br from-blue-500 to-cyan-400 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-lg shadow-blue-500/25">
              {index + 1}
            </span>
            <span className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">{instruction}</span>
          </div>
        ))}
      </div>
    </LiquidGlassSurface>
  );
}
