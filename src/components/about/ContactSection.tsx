import Image from 'next/image';
import { LiquidGlassSurface } from '@/components/ui/LiquidGlassSurface';
import { aboutConfig, iconPaths } from '@/lib/about/aboutConfig';
import { Icon } from './Icon';

// 联系方式组件
export function ContactSection() {
  return (
    <LiquidGlassSurface variant="panel" className="p-6 sm:p-8">
      <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white">联系我们</h3>
      <div className="grid grid-cols-1 gap-3 sm:gap-4">
        {aboutConfig.contacts.map((contact, index) => (
          <a
            key={index}
            href={contact.url}
            target={contact.url.startsWith('mailto:') ? undefined : '_blank'}
            rel={contact.url.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
            className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-2xl border border-white/35 bg-white/25 hover:bg-white/45 dark:bg-gray-900/20 dark:hover:bg-gray-800/45 transition-all touch-manipulation active:scale-95"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden flex items-center justify-center ${contact.bgColor} flex-shrink-0`}>
              {contact.icon === 'github' ? (
                <Image 
                  src="https://cdn.jsdelivr.net/npm/simple-icons@v15/icons/github.svg" 
                  alt="GitHub" 
                  width={24}
                  height={24}
                  className="filter invert dark:invert-0 sm:w-8 sm:h-8"
                />
              ) : contact.icon === 'xiaohongshu' ? (
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d={iconPaths.xiaohongshu} />
                </svg>
              ) : (
                <Icon name="email" className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{contact.name}</h4>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{contact.description}</p>
            </div>
          </a>
        ))}
      </div>
    </LiquidGlassSurface>
  );
}
