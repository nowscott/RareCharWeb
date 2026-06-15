import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pinyin } from 'pinyin';
import { calculateCategoryStats } from '@/lib/core/apiUtils';
import { EmojiData, SymbolData, SymbolDataResponse } from '@/lib/core/types';

// 内存缓存 — 数据文件仅部署时变更，缓存整个进程生命周期
let _symbolsCache: SymbolDataResponse | null = null;
let _emojiCache: SymbolDataResponse | null = null;

function getPublicDataPath(fileName: string) {
  return join(process.cwd(), 'public', 'data', fileName);
}

/**
 * 为 SymbolData 预计算拼音搜索字段
 * 避免客户端每次按键都调用 pinyin()（1000 条 × 3 字段 = 3000 次/按键）
 */
function precomputePinyin(symbols: SymbolData[]): void {
  for (const s of symbols) {
    try {
      s._namePinyin = pinyin(s.name, { style: 'normal', heteronym: false }).join('').toLowerCase();
      s._notesPinyin = pinyin(s.notes, { style: 'normal', heteronym: false }).join('').toLowerCase();
      s._searchTermsPinyin = s.searchTerms.map(term =>
        pinyin(term, { style: 'normal', heteronym: false }).join('').toLowerCase()
      );
    } catch {
      // 拼音转换失败则置空
      s._namePinyin = '';
      s._notesPinyin = '';
      s._searchTermsPinyin = [];
    }
  }
}

export async function getLocalSymbolDataResponse(): Promise<SymbolDataResponse> {
  if (_symbolsCache) return _symbolsCache;

  const raw = await readFile(getPublicDataPath('data.json'), 'utf8');
  const data = JSON.parse(raw) as { version?: unknown; symbols?: unknown };

  if (!Array.isArray(data.symbols)) {
    throw new Error('Invalid symbols data');
  }

  const symbols = data.symbols as SymbolData[];
  precomputePinyin(symbols);

  const categoryStats = calculateCategoryStats(symbols);
  const version = typeof data.version === 'string' ? data.version : 'v1.0.0';

  _symbolsCache = {
    version,
    symbols,
    stats: {
      totalSymbols: symbols.length,
      categoryStats
    }
  };

  return _symbolsCache;
}

export async function getLocalEmojiDataResponse(): Promise<SymbolDataResponse> {
  if (_emojiCache) return _emojiCache;

  const raw = await readFile(getPublicDataPath('emoji-data.json'), 'utf8');
  const data = JSON.parse(raw) as { version?: unknown; emojis?: unknown };

  if (!Array.isArray(data.emojis)) {
    throw new Error('Invalid emoji data');
  }

  const version = typeof data.version === 'string' ? data.version : 'v1.0.0';
  const emojis = data.emojis as EmojiData[];

  const symbols: SymbolData[] = emojis.map((emoji) => ({
    symbol: emoji.emoji,
    name: emoji.name,
    pronunciation: '',
    category: [emoji.category],
    searchTerms: emoji.keywords || [],
    notes: emoji.text || ''
  }));

  precomputePinyin(symbols);

  const categoryStats = calculateCategoryStats(symbols);

  _emojiCache = {
    version,
    symbols,
    stats: {
      totalSymbols: symbols.length,
      categoryStats
    }
  };

  return _emojiCache;
}
