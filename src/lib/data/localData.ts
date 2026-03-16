import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { calculateCategoryStats } from '@/lib/core/apiUtils';
import { EmojiData, SymbolData, SymbolDataResponse } from '@/lib/core/types';
import { shuffleArray } from '@/lib/core/symbolUtils';

function getPublicDataPath(fileName: string) {
  return join(process.cwd(), 'public', 'data', fileName);
}

// 缓存打乱后的数据，每 5 分钟更新一次，保证 SSR 与 Hydration 一致
let cachedSymbolData: { data: SymbolDataResponse; timestamp: number } | null = null;
let cachedEmojiData: { data: SymbolDataResponse; timestamp: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

export async function getLocalSymbolDataResponse(): Promise<SymbolDataResponse> {
  const now = Date.now();
  if (cachedSymbolData && now - cachedSymbolData.timestamp < CACHE_TTL) {
    return cachedSymbolData.data;
  }

  const raw = await readFile(getPublicDataPath('data.json'), 'utf8');
  const data = JSON.parse(raw) as { version?: unknown; symbols?: unknown };

  if (!Array.isArray(data.symbols)) {
    throw new Error('Invalid symbols data');
  }

  const symbols = shuffleArray(data.symbols as SymbolData[]);
  const categoryStats = calculateCategoryStats(symbols);
  const version = typeof data.version === 'string' ? data.version : 'v1.0.0';

  const result = {
    version,
    symbols,
    stats: {
      totalSymbols: symbols.length,
      categoryStats
    }
  };

  cachedSymbolData = { data: result, timestamp: now };
  return result;
}

export async function getLocalEmojiDataResponse(): Promise<SymbolDataResponse> {
  const now = Date.now();
  if (cachedEmojiData && now - cachedEmojiData.timestamp < CACHE_TTL) {
    return cachedEmojiData.data;
  }

  const raw = await readFile(getPublicDataPath('emoji-data.json'), 'utf8');
  const data = JSON.parse(raw) as { version?: unknown; emojis?: unknown };

  if (!Array.isArray(data.emojis)) {
    throw new Error('Invalid emoji data');
  }

  const version = typeof data.version === 'string' ? data.version : 'v1.0.0';
  const emojis = data.emojis as EmojiData[];
  const rawSymbols: SymbolData[] = emojis.map((emoji) => ({
    symbol: emoji.emoji,
    name: emoji.name,
    pronunciation: '',
    category: [emoji.category],
    searchTerms: emoji.keywords || [],
    notes: emoji.text || ''
  }));

  const symbols = shuffleArray(rawSymbols);
  const categoryStats = calculateCategoryStats(symbols);

  const result = {
    version,
    symbols,
    stats: {
      totalSymbols: symbols.length,
      categoryStats
    }
  };

  cachedEmojiData = { data: result, timestamp: now };
  return result;
}
