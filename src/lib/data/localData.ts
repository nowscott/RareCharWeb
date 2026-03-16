import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { calculateCategoryStats } from '@/lib/core/apiUtils';
import { EmojiData, SymbolData, SymbolDataResponse } from '@/lib/core/types';

function getPublicDataPath(fileName: string) {
  return join(process.cwd(), 'public', 'data', fileName);
}

export async function getLocalSymbolDataResponse(): Promise<SymbolDataResponse> {
  const raw = await readFile(getPublicDataPath('data.json'), 'utf8');
  const data = JSON.parse(raw) as { version?: unknown; symbols?: unknown };

  if (!Array.isArray(data.symbols)) {
    throw new Error('Invalid symbols data');
  }

  const symbols = data.symbols as SymbolData[];
  const categoryStats = calculateCategoryStats(symbols);
  const version = typeof data.version === 'string' ? data.version : 'v1.0.0';

  return {
    version,
    symbols,
    stats: {
      totalSymbols: symbols.length,
      categoryStats
    }
  };
}

export async function getLocalEmojiDataResponse(): Promise<SymbolDataResponse> {
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

  const categoryStats = calculateCategoryStats(symbols);

  return {
    version,
    symbols,
    stats: {
      totalSymbols: symbols.length,
      categoryStats
    }
  };
}
