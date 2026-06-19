/**
 * 字体缓存管理模块
 * 集成到全局缓存系统，优化字体加载性能
 */

// 字体缓存接口
interface FontCacheData {
  fonts: Record<string, boolean>; // 字体名称 -> 是否可用
  loadedFonts: string[]; // 已成功加载的字体列表
  timestamp: number; // 缓存时间戳
  version: string; // 缓存版本
}

// 字体配置
interface FontConfig {
  name: string;
  url?: string;
  fallback: string[];
  preload: boolean;
}

// 字体缓存持续时间（24小时）
const FONT_CACHE_DURATION = 24 * 60 * 60 * 1000;
const FONT_CACHE_KEY = 'rarechar_font_cache';
const FONT_CACHE_VERSION = '1.0.0';

// 关键字体配置
const CRITICAL_FONTS: FontConfig[] = [
  {
    name: 'Smiley Sans Oblique',
    url: 'https://f.0211120.xyz/font/得意黑/result.css',
    fallback: ['Arial', 'Helvetica', 'sans-serif'],
    preload: true
  },
  {
    name: 'Noto Sans Symbols 2',
    url: 'https://f.0211120.xyz/font/Noto%20Sans%20Symbols%202/result.css',
    fallback: ['Apple Symbols', 'Segoe UI Symbol', 'sans-serif'],
    preload: true
  }
];

// 系统字体列表（无需缓存）
const SYSTEM_FONTS = [
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Segoe UI Symbol',
  'Apple Symbols',
  'Noto Color Emoji',
  'Twemoji Mozilla'
];

// 内存缓存
let fontMemoryCache: FontCacheData | null = null;
let fontCacheTimestamp = 0;

// 获取字体缓存
function getFontCache(): FontCacheData {
  if (typeof window === 'undefined') {
    return {
      fonts: {},
      loadedFonts: [],
      timestamp: 0,
      version: FONT_CACHE_VERSION
    };
  }

  // 检查内存缓存（5分钟内有效）
  const now = Date.now();
  if (fontMemoryCache && (now - fontCacheTimestamp) < 5 * 60 * 1000) {
    return fontMemoryCache;
  }

  try {
    const cached = localStorage.getItem(FONT_CACHE_KEY);
    if (cached) {
      const parsedCache: FontCacheData = JSON.parse(cached);
      
      // 检查缓存版本和有效期
      if (parsedCache.version === FONT_CACHE_VERSION && 
          (now - parsedCache.timestamp) < FONT_CACHE_DURATION) {
        fontMemoryCache = parsedCache;
        fontCacheTimestamp = now;
        return parsedCache;
      }
    }
  } catch (error) {
    console.warn('读取字体缓存失败:', error);
  }

  // 返回默认缓存
  const defaultCache: FontCacheData = {
    fonts: {},
    loadedFonts: [],
    timestamp: now,
    version: FONT_CACHE_VERSION
  };

  fontMemoryCache = defaultCache;
  fontCacheTimestamp = now;
  return defaultCache;
}

// 保存字体缓存
function saveFontCache(cache: FontCacheData): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(FONT_CACHE_KEY, JSON.stringify(cache));
    fontMemoryCache = cache;
    fontCacheTimestamp = Date.now();
  } catch (error) {
    console.warn('保存字体缓存失败:', error);
  }
}

// 检查字体是否可用（优化版本）
export const isFontAvailable = (fontName: string): boolean => {
  if (typeof window === 'undefined') return false;

  // 检查缓存
  const cache = getFontCache();
  if (cache.fonts[fontName] !== undefined) {
    return cache.fonts[fontName];
  }

  let isAvailable = false;

  try {
    // 优先使用Font Loading API
    if ('fonts' in document && document.fonts.check) {
      isAvailable = document.fonts.check(`16px "${fontName}"`);
    } else {
      // 回退到canvas检测方法
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        const testString = 'mmmmmmmmmmlli';
        const fallbackFont = 'monospace';
        
        context.font = `16px ${fallbackFont}`;
        const fallbackWidth = context.measureText(testString).width;
        
        context.font = `16px "${fontName}", ${fallbackFont}`;
        const testWidth = context.measureText(testString).width;
        
        isAvailable = testWidth !== fallbackWidth;
      }
    }
  } catch (error) {
    console.warn(`字体可用性检查失败 ${fontName}:`, error);
    isAvailable = false;
  }

  // 更新缓存
  cache.fonts[fontName] = isAvailable;
  saveFontCache(cache);

  return isAvailable;
};

// 预加载字体
export const preloadFont = async (fontConfig: FontConfig): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  const cache = getFontCache();
  
  // 检查是否已经加载过
  if (cache.loadedFonts.includes(fontConfig.name)) {
    console.debug(`字体已缓存: ${fontConfig.name}`);
    return true;
  }

  // 系统字体无需预加载
  if (SYSTEM_FONTS.includes(fontConfig.name)) {
    cache.loadedFonts.push(fontConfig.name);
    saveFontCache(cache);
    return true;
  }

  try {
    // 如果有URL，预加载CSS
    if (fontConfig.url) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = fontConfig.url;
      link.crossOrigin = 'anonymous';
      
      // 添加到head
      document.head.appendChild(link);
      
      // 等待加载完成
      await new Promise((resolve, reject) => {
        link.onload = resolve;
        link.onerror = reject;
        setTimeout(reject, 5000); // 5秒超时
      });
    }

    // 使用Font Loading API确保字体加载
    if ('fonts' in document) {
      await document.fonts.load(`16px "${fontConfig.name}"`);
    }

    // 标记为已加载
    cache.loadedFonts.push(fontConfig.name);
    cache.fonts[fontConfig.name] = true;
    saveFontCache(cache);
    
    console.debug(`字体预加载成功: ${fontConfig.name}`);
    return true;
  } catch (error) {
    console.warn(`字体预加载失败 ${fontConfig.name}:`, error);
    cache.fonts[fontConfig.name] = false;
    saveFontCache(cache);
    return false;
  }
};

// 预加载所有关键字体
export const preloadCriticalFonts = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  console.debug('开始预加载关键字体...');
  const startTime = performance.now();

  const promises = CRITICAL_FONTS
    .filter(font => font.preload)
    .map(font => preloadFont(font));

  try {
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    const loadTime = performance.now() - startTime;
    
    console.debug(`关键字体预加载完成: ${successCount}/${promises.length} 成功, 耗时: ${loadTime.toFixed(2)}ms`);
  } catch (error) {
    console.warn('关键字体预加载失败:', error);
  }
};

// 获取字体缓存状态
export const getFontCacheStatus = () => {
  const cache = getFontCache();
  const now = Date.now();
  const ageHours = Math.floor((now - cache.timestamp) / 1000 / 60 / 60);
  const isValid = cache.timestamp > 0 && (now - cache.timestamp) < FONT_CACHE_DURATION;

  return {
    isValid,
    ageHours,
    timestamp: cache.timestamp,
    version: cache.version,
    loadedFonts: cache.loadedFonts.length,
    cachedFonts: Object.keys(cache.fonts).length,
    availableFonts: Object.values(cache.fonts).filter(Boolean).length
  };
};

// 清除字体缓存
export const clearFontCache = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(FONT_CACHE_KEY);
    fontMemoryCache = null;
    fontCacheTimestamp = 0;
    console.debug('字体缓存已清除');
  } catch (error) {
    console.warn('清除字体缓存失败:', error);
  }
};

// 初始化字体缓存系统
export const initializeFontCache = async (): Promise<void> => {
  if (typeof window === 'undefined') return;

  console.debug('初始化字体缓存系统...');
  
  // 预加载关键字体
  await preloadCriticalFonts();
  
  // 等待所有字体加载完成
  if ('fonts' in document) {
    try {
      await document.fonts.ready;
      console.debug('所有字体加载完成');
    } catch (error) {
      console.warn('等待字体加载失败:', error);
    }
  }
};

// 导出字体配置
export { CRITICAL_FONTS, SYSTEM_FONTS };
export type { FontConfig, FontCacheData };
