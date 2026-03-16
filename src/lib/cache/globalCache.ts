import { SymbolDataResponse, SymbolData, EmojiData, EmojiDataResponse } from '../core/types';
import { fetchWithTimeout, calculateCategoryStats } from '../core/apiUtils';

// 缓存接口
interface GlobalCachedData {
  symbolData: SymbolDataResponse | null;
  emojiData: SymbolDataResponse | null;
  timestamp: number;
  symbolOriginalData: SymbolDataResponse | null;
  emojiOriginalData: EmojiDataResponse | null;
}

// 缓存持续时间（1小时）
const CACHE_DURATION = 60 * 60 * 1000;

// 内存缓存，避免重复读取localStorage
let memoryCache: GlobalCachedData | null = null;
let memoryCacheTimestamp = 0;

// 数据源URL
const LOCAL_SYMBOL_DATA_URL = '/data/data.json';
const LOCAL_EMOJI_DATA_URL = '/data/emoji-data.json';

// 缓存键名
const CACHE_KEY = 'rarechar_global_cache';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function toProcessedSymbolData<T extends 'symbol' | 'emoji'>(
  data: unknown,
  dataType: T
): {
  processedData: SymbolDataResponse;
  originalData: T extends 'emoji' ? EmojiDataResponse : SymbolDataResponse;
} {
  if (!isRecord(data)) {
    throw new Error(`${dataType}数据格式无效`);
  }

  const dataArray = dataType === 'emoji' ? data['emojis'] : data['symbols'];
  if (!dataArray || !Array.isArray(dataArray)) {
    throw new Error(`${dataType}数据格式无效`);
  }

  let symbols: SymbolData[];
  if (dataType === 'emoji') {
    symbols = dataArray.map((item: unknown) => {
      const emoji = item as EmojiData;
      return {
        symbol: emoji.emoji,
        name: emoji.name,
        pronunciation: '',
        category: [emoji.category],
        searchTerms: emoji.keywords || [],
        notes: emoji.text || ''
      };
    });
  } else {
    symbols = dataArray as SymbolData[];
  }

  const categoryStats = calculateCategoryStats(symbols);
  const version = typeof data['version'] === 'string' ? data['version'] : 'v1.0.0';
  const originalData =
    dataType === 'emoji'
      ? ({ version, emojis: dataArray as EmojiData[] } as EmojiDataResponse)
      : ({ version, symbols: dataArray as SymbolData[] } as SymbolDataResponse);

  return {
    processedData: {
      version,
      symbols,
      stats: {
        totalSymbols: symbols.length,
        categoryStats
      }
    },
    originalData
  } as {
    processedData: SymbolDataResponse;
    originalData: T extends 'emoji' ? EmojiDataResponse : SymbolDataResponse;
  };
}

// 获取缓存实例（支持内存缓存）
function getGlobalCache(): GlobalCachedData {
  if (typeof window === 'undefined') {
    // 服务端环境，返回空缓存
    return {
      symbolData: null,
      emojiData: null,
      timestamp: 0,
      symbolOriginalData: null,
      emojiOriginalData: null
    };
  }
  
  // 检查内存缓存（5分钟内有效）
  const now = Date.now();
  if (memoryCache && (now - memoryCacheTimestamp) < 5 * 60 * 1000) {
    return memoryCache;
  }
  
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsedCache = JSON.parse(cached);
      // 更新内存缓存
      memoryCache = parsedCache;
      memoryCacheTimestamp = now;
      return parsedCache;
    }
  } catch (error) {
    console.warn('读取缓存失败:', error);
  }
  
  // 返回默认缓存
  const defaultCache = {
    symbolData: null,
    emojiData: null,
    timestamp: 0,
    symbolOriginalData: null,
    emojiOriginalData: null
  };
  
  memoryCache = defaultCache;
  memoryCacheTimestamp = now;
  return defaultCache;
}

// 保存缓存实例（同步更新内存缓存）
function saveGlobalCache(cache: GlobalCachedData): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    // 同步更新内存缓存
    memoryCache = cache;
    memoryCacheTimestamp = Date.now();
  } catch (error) {
    console.warn('保存缓存失败:', error);
  }
}

// 获取缓存状态信息
export function getCacheStatus() {
  const cache = getGlobalCache();
  const now = Date.now();
  const ageMinutes = Math.floor((now - cache.timestamp) / 1000 / 60);
  const isValid = cache.timestamp > 0 && (now - cache.timestamp) < CACHE_DURATION;
  
  return {
    isValid,
    ageMinutes,
    timestamp: cache.timestamp,
    symbolCache: {
      hasData: !!cache.symbolData,
      version: cache.symbolData?.version || null,
      count: cache.symbolData?.symbols?.length || 0
    },
    emojiCache: {
      hasData: !!cache.emojiData,
      version: cache.emojiData?.version || null,
      count: cache.emojiData?.symbols?.length || 0
    }
  };
}

// 获取单个数据源的函数
async function fetchDataSource(
  dataType: 'symbol' | 'emoji'
): Promise<SymbolDataResponse | null> {
  const now = Date.now();
  const globalCache = getGlobalCache();
  const cachedData = dataType === 'symbol' ? globalCache.symbolData : globalCache.emojiData;
  const originalData = dataType === 'symbol' ? globalCache.symbolOriginalData : globalCache.emojiOriginalData;
  
  // 检查缓存是否在1小时内
  if (cachedData && originalData && (now - globalCache.timestamp) < CACHE_DURATION) {
    const cacheAge = Math.floor((now - globalCache.timestamp) / 1000 / 60);
    console.log(`🟢 [${dataType}缓存] 使用缓存 | 时间: ${cacheAge}分钟前 | 版本: ${cachedData.version} | 数量: ${cachedData.symbols.length}`);
    return cachedData;
  }


  const localUrl = dataType === 'symbol' ? LOCAL_SYMBOL_DATA_URL : LOCAL_EMOJI_DATA_URL;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`尝试获取${dataType}数据(本地) (第${attempt}次)...`);
      const response = await fetchWithTimeout(localUrl, 8000);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const { processedData, originalData: newOriginalData } = toProcessedSymbolData(data, dataType);

      if (originalData && originalData.version === newOriginalData.version) {
        console.log(`🟡 [${dataType}缓存状态] 版本号相同，更新缓存时间戳`);
        console.log(`   - 本地版本: ${newOriginalData.version}`);
        console.log(`   - 缓存版本: ${originalData.version}`);
        console.log(`   - 操作: 仅更新时间戳，不重新处理数据`);

        globalCache.timestamp = now;
        saveGlobalCache(globalCache);
        return cachedData!;
      }

      console.log(`🔴 [${dataType}缓存状态] 版本更新或首次获取，处理新数据`);
      if (originalData) {
        console.log(`   - 旧版本: ${originalData.version}`);
        console.log(`   - 新版本: ${newOriginalData.version}`);
        console.log(`   - 操作: 重新处理并更新缓存`);
      } else {
        console.log(`   - 状态: 首次获取${dataType}数据`);
        console.log(`   - 版本: ${newOriginalData.version}`);
        console.log(`   - 操作: 创建新缓存`);
      }

      if (dataType === 'symbol') {
        globalCache.symbolData = processedData;
        globalCache.symbolOriginalData = newOriginalData as SymbolDataResponse;
      } else {
        globalCache.emojiData = processedData;
        globalCache.emojiOriginalData = newOriginalData as EmojiDataResponse;
      }
      globalCache.timestamp = now;
      saveGlobalCache(globalCache);

      console.log(`${dataType}数据获取成功，共${processedData.symbols.length}个数据`);
      return processedData;
    } catch (error) {
      console.error(`第${attempt}次尝试失败:`, error);
      if (attempt < 2) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
  
  // 所有尝试都失败了
  console.error(`所有${dataType}数据获取尝试都失败了，使用备用方案`);
  
  // 如果有缓存数据，返回缓存（即使过期）
  if (cachedData) {
    console.log(`返回过期的${dataType}缓存数据`);
    return cachedData;
  }
  
  // 所有方案都失败了，返回null
  console.log(`所有${dataType}数据获取方案都失败了`);
  return null;
}

// 预加载所有数据
export async function preloadAllData(): Promise<void> {
  console.log('🚀 开始预加载数据到全局缓存...');
  
  try {
    // 并行加载符号数据和表情数据
    const [symbolData, emojiData] = await Promise.all([
      fetchDataSource('symbol'),
      fetchDataSource('emoji')
    ]);
    
    console.log('✅ 全局缓存预加载完成');
    if (symbolData) console.log(`   - 符号数据: ${symbolData.symbols.length}个`);
    if (emojiData) console.log(`   - 表情数据: ${emojiData.symbols.length}个`);
    
  } catch (error) {
    console.error('❌ 全局缓存预加载失败:', error);
  }
}

// 获取符号数据
export async function getSymbolData(): Promise<SymbolDataResponse | null> {
  return fetchDataSource('symbol');
}

// 获取表情数据
export async function getEmojiData(): Promise<SymbolDataResponse | null> {
  return fetchDataSource('emoji');
}
