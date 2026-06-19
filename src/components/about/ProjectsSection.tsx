import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { aboutConfig, iconPaths } from '@/lib/about/aboutConfig';
import { Icon } from './Icon';

// 其他作品组件
export function ProjectsSection() {
  return (
    <LiquidGlassSurface variant="panel" className="p-6 sm:p-8 col-span-full">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">我的其他作品</h3>
      <div className="grid gap-4 sm:gap-6">
        {aboutConfig.projects.map((project, index) => (
          <a
            key={index}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 sm:p-6 rounded-3xl border border-white/35 bg-white/25 hover:bg-white/45 dark:bg-gray-900/20 dark:hover:bg-gray-800/45 hover:border-blue-300/70 dark:hover:border-blue-400/45 hover:shadow-xl transition-all duration-200 group"
          >
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                <Icon name={project.icon as keyof typeof iconPaths} className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  <h4 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h4>
                  <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                    project.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                    project.status === 'beta' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {project.status === 'active' ? '运行中' : 
                     project.status === 'beta' ? '测试版' : '已归档'}
                  </span>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                  {project.description}
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 mb-3 italic">
                  {project.englishDescription}
                </p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0">
                <Icon name="search" className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors transform rotate-45" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </LiquidGlassSurface>
  );
}
